import { useId, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AuthPageShell } from '@/components/auth/AuthPageShell'
import { useAuth } from '@/contexts/AuthContext'
import { useSessionUser } from '@/contexts/SessionUserContext'
import { loginPath } from '@/lib/routes'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const formId = useId()
  const navigate = useNavigate()
  const { isAuthenticated, register } = useAuth()
  const { updateProfile } = useSessionUser()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    if (!acceptedTerms) {
      setError('Aceita os termos para continuar (demonstração).')
      return
    }
    setPending(true)
    try {
      await register(name, username, password)
      const u = username.trim().toLowerCase()
      updateProfile({
        name: name.trim(),
        handle: `@${u.slice(0, 24)}`,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthPageShell
      title="Criar conta"
      subtitle="Preenche os dados abaixo. É uma simulação local — sem API. Utilizador: min. 3 caracteres (a-z, 0-9, _)."
      footer={
        <>
          Já tens conta?{' '}
          <Link to={loginPath()} className="font-medium text-primary underline-offset-2 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor={`${formId}-name`} className="text-xs font-medium text-muted-foreground">
            Nome a mostrar
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            required
            minLength={2}
            className="mt-1.5 w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm outline-none ring-primary/20 focus:border-primary/40 focus:ring-2"
            placeholder="O teu nome"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-username`} className="text-xs font-medium text-muted-foreground">
            Nome de utilizador
          </label>
          <input
            id={`${formId}-username`}
            type="text"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
            required
            minLength={3}
            className="mt-1.5 w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm outline-none ring-primary/20 focus:border-primary/40 focus:ring-2"
            placeholder="ex.: maria_silva"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-password`} className="text-xs font-medium text-muted-foreground">
            Senha
          </label>
          <input
            id={`${formId}-password`}
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
            minLength={6}
            className="mt-1.5 w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm outline-none ring-primary/20 focus:border-primary/40 focus:ring-2"
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-confirm`} className="text-xs font-medium text-muted-foreground">
            Confirmar senha
          </label>
          <input
            id={`${formId}-confirm`}
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            value={confirm}
            onChange={(ev) => setConfirm(ev.target.value)}
            required
            minLength={6}
            className="mt-1.5 w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm outline-none ring-primary/20 focus:border-primary/40 focus:ring-2"
            placeholder="Repete a senha"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(ev) => setAcceptedTerms(ev.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary/30"
          />
          <span>
            Aceito os <span className="text-foreground">termos de utilização simulados</span> desta demonstração
            (sem valor legal).
          </span>
        </label>

        {error ? (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.99] disabled:opacity-60',
          )}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Criar conta
        </button>
      </form>
    </AuthPageShell>
  )
}
