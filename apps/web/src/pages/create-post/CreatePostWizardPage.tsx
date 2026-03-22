import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { PenLine, Image, ClipboardCheck } from 'lucide-react'
import { CreatePostDraftProvider } from '@/contexts/CreatePostDraftContext'
import { useAuth } from '@/contexts/AuthContext'
import { CREATE_POST_STEPS, loginPath, myProfilePath } from '@/lib/routes'
import { cn } from '@/lib/utils'

const steps = [
  { path: CREATE_POST_STEPS.content, label: 'Texto', icon: PenLine },
  { path: CREATE_POST_STEPS.media, label: 'Mídia', icon: Image },
  { path: CREATE_POST_STEPS.review, label: 'Rever', icon: ClipboardCheck },
] as const

function WizardShell() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-10">
      <NavLink
        to={myProfilePath()}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Voltar ao teu perfil
      </NavLink>

      <header className="mt-6 border-b border-border/60 pb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Nova postagem</p>
        <h1 className="mt-2 font-display text-2xl font-light text-foreground md:text-3xl">
          Criar em passos
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cada passo é uma página separada (demonstração — sem gravação no feed).
        </p>

        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Passos da nova postagem">
          {steps.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="py-8">
        <Outlet />
      </div>
    </div>
  )
}

export default function CreatePostWizardPage() {
  const { isAuthenticated } = useAuth()
  const { pathname, search } = useLocation()

  if (!isAuthenticated) {
    const from = encodeURIComponent(`${pathname}${search}`)
    return <Navigate to={`${loginPath()}?from=${from}`} replace />
  }

  return (
    <CreatePostDraftProvider>
      <WizardShell />
    </CreatePostDraftProvider>
  )
}
