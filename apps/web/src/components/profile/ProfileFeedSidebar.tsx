import { Link } from 'react-router-dom'
import { sidebarReputationContext } from '@/data/mockUsers'
import {
  getHighestRatedSidebarRows,
  getTrendingSidebarRows,
} from '@/data/socialPosts.index'

export function ProfileFeedSidebar() {
  const trendingRows = getTrendingSidebarRows(5)
  const highestRatedRows = getHighestRatedSidebarRows(5)

  return (
    <aside className="space-y-6 lg:col-span-4">
      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h3 className="text-sm uppercase tracking-[0.25em] text-neutral-400">Em alta</h3>
        <div className="mt-4 space-y-4">
          {trendingRows.length === 0 ? (
            <p className="text-sm text-neutral-500">Sem posts em alta no mock.</p>
          ) : (
            trendingRows.map((item) => (
              <Link
                key={item.postId}
                to={`/post/${item.postId}`}
                className="flex items-center justify-between border-b border-neutral-100 pb-3 text-left transition-colors last:border-b-0 last:pb-0 hover:text-primary"
              >
                <span className="min-w-0 flex-1 pr-2 text-sm text-neutral-600">{item.label}</span>
                <span className="shrink-0 text-lg font-light tabular-nums text-neutral-900">
                  {item.score}
                </span>
              </Link>
            ))
          )}
        </div>
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
        <div className="mt-4 space-y-4">
          {highestRatedRows.length === 0 ? (
            <p className="text-sm text-neutral-500">Sem posts com destaque de avaliação no mock.</p>
          ) : (
            highestRatedRows.map((row, index) => (
              <Link
                key={row.postId}
                to={`/post/${row.postId}`}
                className="flex items-start gap-3 rounded-lg text-left transition-colors hover:bg-stone-50/80"
              >
                <span className="mt-0.5 text-xs text-neutral-400">0{index + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm text-neutral-900">{row.title}</p>
                  <p className="text-xs text-neutral-400">{row.meta}</p>
                </div>
              </Link>
            ))
          )}
        </div>
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
      </div>
    </aside>
  )
}
