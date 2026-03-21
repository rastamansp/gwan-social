import { useSessionUser } from '@/contexts/SessionUserContext'
import { getTierColor, getTierLabel } from '@/data/mockUsers'
import { StarRating } from '@/components/social/StarRating'
import { cn } from '@/lib/utils'

const COVER_URL =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&auto=format&fit=crop'

export function ProfileHeader() {
  const { profile } = useSessionUser()
  return (
    <div className="relative mb-8 animate-fade-up overflow-hidden rounded-3xl">
      <div className="absolute inset-0">
        <img src={COVER_URL} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
      </div>
      <div className="relative flex items-end gap-5 px-6 pt-32 pb-6">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="h-24 w-24 rounded-3xl border-4 border-card object-cover shadow-lg ring-2 ring-primary/20"
        />
        <div className="min-w-0 flex-1 pb-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold leading-tight">{profile.name}</h1>
            <span
              className={cn(
                'rating-glow rounded-full border border-primary/20 bg-card/80 px-3 py-1 font-display text-xs font-bold backdrop-blur-sm',
                getTierColor(profile.tier),
              )}
            >
              {getTierLabel(profile.tier)}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{profile.handle}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="font-display text-3xl font-bold tabular-nums">
              {profile.rating.toFixed(1)}
            </span>
            <div>
              <StarRating rating={profile.rating} size="md" />
              <span className="text-xs text-muted-foreground">
                {profile.ratingCount.toLocaleString()} avaliações
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
