import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'

type AuthPageShellProps = {
  title: string
  subtitle: ReactNode
  children: ReactNode
  footer: ReactNode
}

export function AuthPageShell({ title, subtitle, children, footer }: AuthPageShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Star size={16} className="fill-primary text-primary" aria-hidden />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">Gwan</span>
          </Link>
          <Link
            to="/presentation"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sobre o projeto
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
          <div className="mt-2 text-sm text-muted-foreground">{subtitle}</div>

          <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
            {children}
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </main>
    </div>
  )
}
