import { Link } from 'react-router-dom'
import type { UserProfile } from '@/data/legacyFeed.types'
import { getTierColor, getTierLabel } from '@/data/user-profile-ui'
import { StarRating } from '@/components/social/StarRating'
import { cn } from '@/lib/utils'

interface UserCardProps {
  user: UserProfile
  onRate?: (userId: string, value: number) => void
  animationDelay?: number
}

export function UserCard({ user, onRate, animationDelay = 0 }: UserCardProps) {
  return (
    <div
      className="card-hover animate-fade-up rounded-2xl border border-border/50 bg-card p-5 shadow-sm"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-start gap-4">
        <Link
          to={`/user/${user.id}`}
          className="shrink-0 rounded-2xl outline-none ring-primary/30 focus-visible:ring-2"
        >
          <img
            src={user.avatar}
            alt=""
            className="h-14 w-14 rounded-2xl object-cover shadow-md transition hover:opacity-90"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              to={`/user/${user.id}`}
              className="truncate font-display font-semibold text-foreground hover:underline"
            >
              {user.name}
            </Link>
            <span
              className={cn(
                'rounded-full bg-muted px-2 py-0.5 font-display text-xs font-semibold',
                getTierColor(user.tier),
              )}
            >
              {getTierLabel(user.tier)}
            </span>
          </div>
          <Link
            to={`/user/${user.id}`}
            className="block text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            {user.handle}
          </Link>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-display text-lg font-bold tabular-nums">{user.rating.toFixed(1)}</span>
            <StarRating
              rating={user.rating}
              size="sm"
              interactive={!!onRate}
              onRate={(v) => onRate?.(user.id, v)}
            />
            <span className="text-xs text-muted-foreground">
              ({user.ratingCount.toLocaleString()})
            </span>
          </div>
          {[user.headline, user.bio].some((s) => s.trim()) ? (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {[user.headline, user.bio].map((s) => s.trim()).filter(Boolean).join(' · ')}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
