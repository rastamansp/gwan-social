import { useId, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AuthPageShell } from '@/components/auth/AuthPageShell'
import { DEMO_TEST_PASSWORD, DEMO_TEST_USER, useAuth } from '@/contexts/AuthContext'
import { isApiEnabled } from '@/lib/api/config'
import { registerPath } from '@/lib/routes'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const formId = useId()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, login } = useAuth()

  const [username, setUsername] = useState<string>(DEMO_TEST_USER)
  const [password, setPassword] = useState<string>(DEMO_TEST_PASSWORD)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const redirectTo = searchParams.get('from') || '/'
  const safeRedirect = redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/'

  if (isAuthenticated) {
    return <Navigate to={safeRedirect} replace />
  }

  const apiMode = isApiEnabled()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await login(username, password)
      navigate(safeRedirect, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthPageShell
      title="Entrar"
      subtitle={
        apiMode ? (
          <>
            Sessão via API Nest (<code className="rounded bg-muted px-1 py-0.5 text-xs">POST /auth/login</code>
            ). Utilizador e senha são os da base de dados (ex.: conta criada em registo ou seed).
          </>
        ) : (
          <>
            Utilizador e senha (demonstração local). Conta de teste:{' '}
            <strong className="text-foreground">
              {DEMO_TEST_USER}
            </strong>{' '}
            /{' '}
            <strong className="text-foreground">{DEMO_TEST_PASSWORD}</strong>
          </>
        )
      }
      footer={
        <>
          Ainda não tens conta?{' '}
          <Link to={registerPath()} className="font-medium text-primary underline-offset-2 hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor={`${formId}-username`} className="text-xs font-medium text-muted-foreground">
            Utilizador
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
            placeholder={DEMO_TEST_USER}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Min. 3 caracteres: letras minúsculas, números ou _
          </p>
        </div>
        <div>
          <label htmlFor={`${formId}-password`} className="text-xs font-medium text-muted-foreground">
            Senha
          </label>
          <input
            id={`${formId}-password`}
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
            minLength={6}
            className="mt-1.5 w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm outline-none ring-primary/20 focus:border-primary/40 focus:ring-2"
            placeholder="••••••••"
          />
        </div>

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
          Entrar
        </button>
      </form>

      <p className="mt-6 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
        {apiMode
          ? 'Os tokens JWT ficam guardados neste browser (localStorage). Confirma CORS e VITE_API_URL se algo falhar.'
          : 'Modo demonstração: nada é enviado a um servidor; a sessão fica guardada neste browser.'}
      </p>
    </AuthPageShell>
  )
}
