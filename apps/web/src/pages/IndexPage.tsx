import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProfileFeedLayout } from '@/components/profile/ProfileFeedLayout'
import { FeedPostList } from '@/components/social/FeedPostList'
import { Leaderboard } from '@/components/social/Leaderboard'
import { UserCard } from '@/components/social/UserCard'
import { useAuth } from '@/contexts/AuthContext'
import { useSessionUser } from '@/contexts/SessionUserContext'
import { users } from '@/data/mockUsers'
import { MAIN_NAV_TABS } from '@/lib/main-nav'
import { RANKING_MODES, parseRankingMode, type RankingMode } from '@/lib/ranking-modes'
import { cn } from '@/lib/utils'

export default function IndexPage() {
  const { isAuthenticated } = useAuth()
  const { resolveUser } = useSessionUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = useMemo(() => {
    const t = MAIN_NAV_TABS.includes(tabParam as (typeof MAIN_NAV_TABS)[number]) ? tabParam! : 'feed'
    if (t === 'profile' && !isAuthenticated) return 'feed'
    return t
  }, [tabParam, isAuthenticated])

  useEffect(() => {
    if (tabParam === 'profile' && !isAuthenticated) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete('tab')
          return next
        },
        { replace: true },
      )
    }
  }, [tabParam, isAuthenticated, setSearchParams])

  const rankingMode = useMemo(() => parseRankingMode(searchParams), [searchParams])

  const setRankingMode = useCallback(
    (rank: RankingMode) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tab', 'ranking')
          next.set('rank', rank)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col',
        activeTab === 'profile' ? 'bg-stone-100' : 'bg-background',
      )}
    >
      <main
        className={cn(
          'flex-1',
          activeTab === 'feed' || activeTab === 'profile'
            ? 'w-full max-w-none py-0'
            : 'container mx-auto max-w-3xl px-4 py-6',
        )}
      >
        {activeTab === 'feed' && <FeedPostList />}

        {activeTab === 'profile' && <ProfileFeedLayout />}

        {activeTab === 'pessoas' && (
          <div className="space-y-3">
            <h2 className="font-display mb-4 animate-fade-up text-xl font-bold">Pessoas</h2>
            {users.map((user, i) => (
              <div key={user.id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <UserCard user={resolveUser(user.id) ?? user} animationDelay={0} onRate={() => {}} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="animate-fade-up space-y-4 px-1 sm:space-y-5 sm:px-0">
            <div>
              <h2 className="font-display text-xl font-bold">Ranking social</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolhe o critério de ordenação. O endereço guarda o filtro em{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">?rank=</code>.
              </p>
            </div>

            <div
              className="flex flex-wrap gap-2 border-b border-border/50 pb-1"
              role="tablist"
              aria-label="Tipo de ranking"
            >
              {RANKING_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={rankingMode === m.id}
                  onClick={() => setRankingMode(m.id)}
                  title={m.hint}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                    rankingMode === m.id
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">{RANKING_MODES.find((m) => m.id === rankingMode)?.hint}</p>

            <Leaderboard mode={rankingMode} />
          </div>
        )}
      </main>
    </div>
  )
}
