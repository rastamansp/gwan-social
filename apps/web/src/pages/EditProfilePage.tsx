import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { Camera, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSessionUser } from '@/contexts/SessionUserContext'
import { ApiHttpError } from '@/lib/api/client'
import { isApiEnabled } from '@/lib/api/config'
import { fetchPatchMe, fetchPostMeAvatar } from '@/lib/api/endpoints'
import { loginPath, myProfilePath, userProfilePath } from '@/lib/routes'
import { cn } from '@/lib/utils'

const MAX_AVATAR_FILE_BYTES = 2 * 1024 * 1024

function normalizeHandle(raw: string) {
  const t = raw.trim()
  if (!t) return ''
  const withoutAt = t.replace(/^@+/, '')
  return `@${withoutAt}`
}

function handleToUsername(raw: string): string {
  return raw.trim().replace(/^@+/, '').toLowerCase()
}

export default function EditProfilePage() {
  const { isAuthenticated } = useAuth()
  const { userId: sessionId, profile, updateProfile, clearProfileOverrides } = useSessionUser()
  const { userId = '' } = useParams()
  const { pathname, search } = useLocation()
  const formId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarObjectUrlRef = useRef<string | null>(null)

  const [name, setName] = useState(profile.name)
  const [handle, setHandle] = useState(profile.handle)
  const [email, setEmail] = useState(profile.email ?? '')
  const [headline, setHeadline] = useState(profile.headline)
  const [bio, setBio] = useState(profile.bio)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar)
  const [pendingAvatarDataUrl, setPendingAvatarDataUrl] = useState<string | null>(null)
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loadingFile, setLoadingFile] = useState(false)
  const [saving, setSaving] = useState(false)

  const apiMode = isApiEnabled()

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current)
        avatarObjectUrlRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    setName(profile.name)
    setHandle(profile.handle)
    setEmail(profile.email ?? '')
    setHeadline(profile.headline ?? '')
    setBio(profile.bio ?? '')
    setAvatarPreview(profile.avatar)
    setPendingAvatarFile(null)
    setPendingAvatarDataUrl(null)
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current)
      avatarObjectUrlRef.current = null
    }
  }, [profile.id, profile.name, profile.handle, profile.email, profile.headline, profile.bio, profile.avatar])

  const onPickPhoto = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) {
      setError('Escolhe um ficheiro de imagem válido.')
      return
    }
    if (
      apiMode &&
      file.type !== 'image/jpeg' &&
      file.type !== 'image/png' &&
      file.type !== 'image/webp'
    ) {
      setError('Com a API ativa, usa JPEG, PNG ou WebP.')
      return
    }
    if (file.size > MAX_AVATAR_FILE_BYTES) {
      setError(
        `A imagem deve ter no máximo ${Math.round(MAX_AVATAR_FILE_BYTES / 1024 / 1024)} MB (limite da API).`,
      )
      return
    }
    setError(null)
    if (apiMode) {
      setPendingAvatarFile(file)
      setPendingAvatarDataUrl(null)
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current)
      }
      const url = URL.createObjectURL(file)
      avatarObjectUrlRef.current = url
      setAvatarPreview(url)
      return
    }
    setLoadingFile(true)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      if (!dataUrl) {
        setLoadingFile(false)
        setError('Não foi possível ler a imagem.')
        return
      }
      setPendingAvatarDataUrl(dataUrl)
      setAvatarPreview(dataUrl)
      setLoadingFile(false)
    }
    reader.onerror = () => {
      setLoadingFile(false)
      setError('Erro ao ler o ficheiro.')
    }
    reader.readAsDataURL(file)
  }, [apiMode])

  if (!isAuthenticated) {
    const from = encodeURIComponent(`${pathname}${search}`)
    return <Navigate to={`${loginPath()}?from=${from}`} replace />
  }

  if (userId !== sessionId) {
    return <Navigate to={userId ? userProfilePath(userId) : '/'} replace />
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const n = name.trim()
    if (!n) {
      setError('O nome é obrigatório.')
      return
    }
    const h = normalizeHandle(handle)
    if (!h || h === '@') {
      setError('Indica um nome de utilizador (@utilizador).')
      return
    }
    const username = handleToUsername(h)
    if (username.length < 3) {
      setError('Utilizador: mínimo 3 caracteres.')
      return
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setError('Utilizador: só letras minúsculas, números e underscore (_).')
      return
    }

    const emailTrim = email.trim()
    if (emailTrim && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setError('Indica um email válido ou deixa o campo em branco.')
      return
    }

    if (apiMode) {
      setSaving(true)
      try {
        if (pendingAvatarFile) {
          await fetchPostMeAvatar(pendingAvatarFile)
        }
        const me = await fetchPatchMe({
          displayName: n,
          username,
          headline: headline.trim(),
          bio: bio.trim(),
          email: emailTrim,
        })
        if (avatarObjectUrlRef.current) {
          URL.revokeObjectURL(avatarObjectUrlRef.current)
          avatarObjectUrlRef.current = null
        }
        setPendingAvatarFile(null)
        setAvatarPreview(me.avatarUrl || profile.avatar)
        setEmail(me.email?.trim() ?? '')
        clearProfileOverrides()
        window.dispatchEvent(
          new CustomEvent<{ username: string }>('gwan-profile-updated', { detail: { username } }),
        )
        window.dispatchEvent(new Event('gwan-auth-changed'))
        setPendingAvatarDataUrl(null)
        setSaved(true)
        window.setTimeout(() => setSaved(false), 3500)
      } catch (err) {
        setError(err instanceof ApiHttpError ? err.message : 'Não foi possível guardar o perfil.')
      } finally {
        setSaving(false)
      }
      return
    }

    updateProfile({
      name: n,
      handle: h,
      email: emailTrim,
      headline: headline.trim(),
      bio: bio.trim(),
      ...(pendingAvatarDataUrl ? { avatar: pendingAvatarDataUrl } : {}),
    })
    setPendingAvatarDataUrl(null)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 3500)
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 md:py-10">
      <Link
        to={myProfilePath()}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Voltar ao perfil
      </Link>

      <header className="mt-6">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Conta</p>
        <h1 className="mt-2 font-display text-2xl font-light text-foreground md:text-3xl">
          Editar perfil
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {apiMode
            ? 'Os dados e a foto de perfil são guardados na API: texto em PostgreSQL e imagem no armazenamento MinIO (S3).'
            : 'Alterações guardadas neste dispositivo (demonstração — sem API). Quando existir backend, este formulário passará a sincronizar com o servidor.'}
        </p>
      </header>

      <form
        id={formId}
        onSubmit={onSubmit}
        className="mt-8 space-y-8 rounded-[28px] border border-border/60 bg-card p-6 shadow-sm ring-1 ring-black/5"
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            {/* Clicar na foto abre o seletor (comportamento esperado no mobile/desktop). */}
            <button
              type="button"
              onClick={onPickPhoto}
              disabled={loadingFile}
              className="group relative flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-2 ring-primary/30 transition hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Alterar foto de perfil — escolher imagem do dispositivo"
            >
              <img
                src={avatarPreview}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
              <span
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition group-hover:bg-black/25 group-focus-visible:bg-black/25"
                aria-hidden
              />
              <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-card">
                {loadingFile ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className="sr-only"
              disabled={loadingFile}
              onChange={onFileChange}
            />
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-sm font-medium text-foreground">Foto de perfil</p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG ou WebP · máx. {Math.round(MAX_AVATAR_FILE_BYTES / 1024 / 1024)} MB
            </p>
            <button
              type="button"
              onClick={onPickPhoto}
              disabled={loadingFile}
              className="mt-3 text-sm font-medium text-primary underline-offset-2 hover:underline disabled:opacity-50"
            >
              Escolher imagem
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor={`${formId}-name`} className="text-xs font-medium text-muted-foreground">
              Nome a mostrar
            </label>
            <input
              id={`${formId}-name`}
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              autoComplete="name"
              className="mt-1.5 w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm outline-none ring-primary/20 focus:border-primary/40 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-handle`} className="text-xs font-medium text-muted-foreground">
              Nome de utilizador
            </label>
            <input
              id={`${formId}-handle`}
              value={handle}
              onChange={(ev) => setHandle(ev.target.value)}
              autoComplete="username"
              placeholder="@utilizador"
              className="mt-1.5 w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm outline-none ring-primary/20 focus:border-primary/40 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-email`} className="text-xs font-medium text-muted-foreground">
              Email
            </label>
            <input
              id={`${formId}-email`}
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              autoComplete="email"
              placeholder="ex.: nome@exemplo.com"
              className="mt-1.5 w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm outline-none ring-primary/20 focus:border-primary/40 focus:ring-2"
            />
            {apiMode ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Opcional ao criar conta; podes alterar ou limpar aqui (único na base de dados).
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Guardado localmente com o resto do perfil.</p>
            )}
          </div>
          <div>
            <label htmlFor={`${formId}-headline`} className="text-xs font-medium text-muted-foreground">
              Headline
            </label>
            <input
              id={`${formId}-headline`}
              value={headline}
              onChange={(ev) => setHeadline(ev.target.value)}
              maxLength={apiMode ? 280 : undefined}
              placeholder="Uma linha curta sobre ti"
              className="mt-1.5 w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm outline-none ring-primary/20 focus:border-primary/40 focus:ring-2"
            />
            {apiMode ? (
              <p className="mt-1 text-xs text-muted-foreground">Máximo 280 caracteres (campo headline na API).</p>
            ) : null}
          </div>
          <div>
            <label htmlFor={`${formId}-bio`} className="text-xs font-medium text-muted-foreground">
              Bio
            </label>
            <textarea
              id={`${formId}-bio`}
              value={bio}
              onChange={(ev) => setBio(ev.target.value)}
              rows={4}
              maxLength={apiMode ? 2000 : undefined}
              className="mt-1.5 w-full resize-y rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm outline-none ring-primary/20 focus:border-primary/40 focus:ring-2"
            />
            {apiMode ? (
              <p className="mt-1 text-xs text-muted-foreground">Máximo 2000 caracteres (limite da API).</p>
            ) : null}
          </div>
        </div>

        {error ? (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {saved ? (
          <p
            className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-800/60"
            role="status"
          >
            {apiMode
              ? 'Perfil atualizado no servidor.'
              : 'Perfil atualizado. A navegação e o feed passam a usar estes dados neste browser.'}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className={cn(
              'inline-flex flex-1 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98] sm:flex-none',
              saving && 'opacity-60',
            )}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
            Guardar alterações
          </button>
          <Link
            to={myProfilePath()}
            className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted/50"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
