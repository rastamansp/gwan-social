import type { UserProfile } from '@/data/legacyFeed.types'
import { getTierColor, getTierLabel } from '@/data/user-profile-ui'
import { AVATAR_FALLBACK } from '@/data/ui-constants'
import { cn } from '@/lib/utils'

export type UserTooltipCardState =
  | { status: 'ready'; profile: UserProfile }
  | { status: 'loading'; label: string; avatarUrl?: string; rating?: number }
  | { status: 'error'; message?: string }

interface UserTooltipCardProps {
  state: UserTooltipCardState
  className?: string
}

export function UserTooltipCard({ state, className }: UserTooltipCardProps) {
  return (
    <div
      className={cn(
        'pointer-events-none z-[300] w-[min(100vw-1.5rem,260px)] rounded-xl border border-border/80 bg-popover/95 p-3 text-popover-foreground shadow-xl backdrop-blur-sm',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {state.status === 'error' ? (
        <p className="text-center text-sm text-muted-foreground">
          {state.message ?? 'Não foi possível carregar o perfil.'}
        </p>
      ) : state.status === 'loading' ? (
        <div className="flex gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
            {state.avatarUrl ? (
              <img src={state.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="truncate font-display text-sm font-semibold">{state.label}</p>
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            <div className="h-2 w-24 animate-pulse rounded bg-muted/80" />
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <img
            src={state.profile.avatar || AVATAR_FALLBACK}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-border shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-semibold">{state.profile.name}</p>
            {state.profile.handle.trim() ? (
              <p className="truncate text-xs text-muted-foreground">{state.profile.handle}</p>
            ) : null}
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="font-display text-lg font-bold tabular-nums text-foreground">
                {state.profile.rating.toFixed(1)}
              </span>
              <span
                className={cn(
                  'rounded-full bg-muted px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wide',
                  getTierColor(state.profile.tier),
                )}
              >
                {getTierLabel(state.profile.tier)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
