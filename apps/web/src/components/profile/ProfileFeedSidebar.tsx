import { Link } from 'react-router-dom'
import { sidebarReputationContext } from '@/data/ui-constants'

export function ProfileFeedSidebar() {
  return (
    <aside className="space-y-6 lg:col-span-4">
      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h3 className="text-sm uppercase tracking-[0.25em] text-neutral-400">Em alta</h3>
        <p className="mt-4 text-sm text-neutral-500">
          Agregação de trending ainda não está exposta na API. Usa o feed principal para ver publicações
          recentes.
        </p>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h3 className="text-sm uppercase tracking-[0.25em] text-neutral-400">No lago</h3>
        <p className="mt-4 text-sm leading-6 text-neutral-600">
          Destaques recentes, interações em eventos, reputação por contexto e conteúdos em alta na tua
          rede.
        </p>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h3 className="text-sm uppercase tracking-[0.25em] text-neutral-400">Posts mais bem avaliados</h3>
        <p className="mt-4 text-sm text-neutral-500">
          Lista curada por avaliação virá quando o backend expuser um endpoint dedicado.
        </p>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h3 className="text-sm uppercase tracking-[0.25em] text-neutral-400">Contexto de reputação</h3>
        <div className="mt-4 space-y-3">
          {sidebarReputationContext.map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between text-sm text-neutral-700">
                <span>{label}</span>
                <span className="tabular-nums text-neutral-900">{value}</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100">
                <div
                  className="h-2 rounded-full bg-neutral-900"
                  style={{ width: `${Math.min(100, Number(value) * 20)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-neutral-400">
          Valores ilustrativos até existir reputação por contexto na API.
        </p>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h3 className="text-sm uppercase tracking-[0.25em] text-neutral-400">Explorar</h3>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Ir para o feed
        </Link>
      </div>
    </aside>
  )
}
