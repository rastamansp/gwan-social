import { useMemo } from 'react'
import { UserProfileHoverLink } from '@/components/social/user-tooltip-card'
import { userProfilePath } from '@/lib/routes'
import { TrendingDown, TrendingUp, Trophy } from 'lucide-react'
import { ApiRequiredMessage } from '@/components/common/ApiRequiredMessage'
import { useSessionUser } from '@/contexts/SessionUserContext'
import type { UserProfile } from '@/data/legacyFeed.types'
import { useAuthorProfilesFromFeed } from '@/hooks/useAuthorProfilesFromFeed'
import type { RankingMode } from '@/lib/ranking-modes'
import { StarRating } from '@/components/social/StarRating'
import { cn } from '@/lib/utils'
import { getTierColor, getTierLabel } from '@/data/user-profile-ui'

function tierOrder(tier: UserProfile['tier']): number {
  switch (tier) {
    case 'elite':
      return 4
    case 'premium':
      return 3
    case 'standard':
      return 2
    case 'low':
      return 1
    default:
      return 0
  }
}

function sortUsersForMode(mode: RankingMode, list: UserProfile[]): UserProfile[] {
  const copy = [...list]
  switch (mode) {
    case 'reputation':
      return copy.sort((a, b) => b.rating - a.rating)
    case 'volume':
      return copy.sort((a, b) => b.ratingCount - a.ratingCount || b.rating - a.rating)
    case 'tier':
      return copy.sort(
        (a, b) => tierOrder(b.tier) - tierOrder(a.tier) || b.rating - a.rating,
      )
    case 'engagement':
      return copy.sort((a, b) => {
        const sa = a.rating * Math.log1p(a.ratingCount)
        const sb = b.rating * Math.log1p(b.ratingCount)
        return sb - sa
      })
    default:
      return copy.sort((a, b) => b.rating - a.rating)
  }
}

function engagementScore(user: UserProfile): number {
  return user.rating * Math.log1p(user.ratingCount)
}

interface LeaderboardProps {
  mode: RankingMode
}

export function Leaderboard({ mode }: LeaderboardProps) {
  const { resolveUser } = useSessionUser()
  const { profiles, status, useApi, errorMessage } = useAuthorProfilesFromFeed(50)

  const sorted = useMemo(
    () => sortUsersForMode(mode, profiles.map((p) => resolveUser(p.id) ?? p)),
    [mode, profiles, resolveUser],
  )

  if (!useApi) {
    return <ApiRequiredMessage title="Ranking" />
  }

  if (status === 'loading' && sorted.length === 0) {
    return (
      <p className="rounded-2xl border border-border/50 bg-card px-5 py-8 text-center text-sm text-muted-foreground">
        A carregar autores do feed…
      </p>
    )
  }

  if (status === 'err') {
    return (
      <p className="rounded-2xl border border-border/50 bg-card px-5 py-8 text-center text-sm text-destructive">
        {errorMessage ?? 'Não foi possível carregar dados para o ranking.'}
      </p>
    )
  }

  if (sorted.length === 0) {
    return (
      <p className="rounded-2xl border border-border/50 bg-card px-5 py-8 text-center text-sm text-muted-foreground">
        Ainda não há autores no feed para mostrar no ranking. Publica ou segue conteúdo na API.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/40 p-5">
        <Trophy size={18} className="text-rating-gold" />
        <h2 className="font-display text-lg font-bold">Classificação</h2>
      </div>
      <div className="divide-y divide-border/30">
        {sorted.map((user, i) => (
          <UserProfileHoverLink
            key={user.id}
            userId={user.id}
            to={userProfilePath(user.id)}
            cachedProfile={user}
            wrapperClassName="block w-full"
            className="animate-fade-up flex w-full items-center gap-3 px-5 py-3.5 transition-colors duration-200 hover:bg-muted/50"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="w-6 text-center font-display text-sm font-bold tabular-nums text-muted-foreground">
              {i + 1}
            </span>
            <img src={user.avatar} alt="" className="h-9 w-9 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <span className="block truncate font-display text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {mode === 'volume' ? (
                  <>
                    {user.ratingCount.toLocaleString()} avaliações · média {user.rating.toFixed(1)}
                  </>
                ) : mode === 'tier' ? (
                  <>
                    {getTierLabel(user.tier)} · {user.ratingCount.toLocaleString()} avaliações
                  </>
                ) : mode === 'engagement' ? (
                  <>
                    Índice {engagementScore(user).toFixed(2)} · {user.rating.toFixed(1)} ★
                  </>
                ) : (
                  <>{user.ratingCount.toLocaleString()} avaliações</>
                )}
              </span>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
              {mode === 'volume' ? (
                <>
                  <span className="font-display text-sm font-bold tabular-nums text-foreground">
                    {user.ratingCount.toLocaleString()}
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">avaliações</span>
                </>
              ) : mode === 'tier' ? (
                <span
                  className={cn(
                    'rounded-full bg-muted px-2 py-0.5 font-display text-xs font-semibold',
                    getTierColor(user.tier),
                  )}
                >
                  {getTierLabel(user.tier)}
                </span>
              ) : mode === 'engagement' ? (
                <span className="font-display text-sm font-bold tabular-nums text-foreground">
                  {engagementScore(user).toFixed(1)}
                </span>
              ) : null}
              <div className="flex items-center gap-2">
                <span className={`font-display font-bold tabular-nums ${getTierColor(user.tier)}`}>
                  {user.rating.toFixed(1)}
                </span>
                <StarRating rating={user.rating} size="sm" />
                {mode === 'reputation' ? (
                  user.rating >= 4.0 ? (
                    <TrendingUp size={14} className="text-secondary-foreground" />
                  ) : user.rating < 3.0 ? (
                    <TrendingDown size={14} className="text-rating-low" />
                  ) : null
                ) : null}
              </div>
            </div>
          </UserProfileHoverLink>
        ))}
      </div>
    </div>
  )
}
