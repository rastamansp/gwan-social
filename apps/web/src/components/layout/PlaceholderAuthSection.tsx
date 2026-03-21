import { Link } from 'react-router-dom'
import { loginPath, registerPath } from '@/lib/routes'

/** Bloco CTA da landing — liga às páginas de login e cadastro da app. */
export function PlaceholderAuthSection() {
  return (
    <section
      id="entrada"
      className="border-t border-white/10 bg-slate-900/40 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl shadow-black/30">
          <h2 className="text-center text-lg font-semibold text-white">Área de entrada</h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Entra ou cria conta na demonstração web. Quando a API Nest estiver pronta, os mesmos fluxos passarão
            a usar <code className="text-cyan-300">/v1</code>.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to={loginPath()}
              className="inline-flex w-full items-center justify-center rounded-xl bg-white py-3 text-center text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white/90 sm:w-auto sm:min-w-[140px]"
            >
              Entrar
            </Link>
            <Link
              to={registerPath()}
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto sm:min-w-[140px]"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
