import { Link } from 'react-router-dom'
import { loginPath, registerPath } from '@/lib/routes'

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-cyan-500/20"
            aria-hidden
          >
            G
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-white">
              Gwan Social Reputation
            </p>
            <p className="text-xs text-slate-400">Reputação contextual</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to={loginPath()}
            className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white ring-1 ring-white/15 transition hover:bg-white/15 sm:hidden"
          >
            Entrar
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 sm:flex" aria-label="Principal">
            <a href="#sobre" className="transition hover:text-white">
              Sobre
            </a>
            <a href="#visao" className="transition hover:text-white">
              Visão
            </a>
            <Link to="/" className="transition hover:text-white">
              Abrir app
            </Link>
            <Link
              to={registerPath()}
              className="transition hover:text-white"
            >
              Cadastro
            </Link>
            <Link
              to={loginPath()}
              className="rounded-full bg-white/10 px-4 py-2 font-medium text-white ring-1 ring-white/15 transition hover:bg-white/15"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
