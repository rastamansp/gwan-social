import type { HydratedFixtures } from '../../infrastructure/fixtures/hydrateFixtures'
import { orderPostsForFeed } from '../../infrastructure/fixtures/feedOrder'
import type { SocialPost } from '../../types/socialPost.types'

export interface NearbyUi {
  nearbyPostDistances?: { postId: string; distanceKm: number }[]
}

export function publicUser(h: HydratedFixtures, userId: string) {
  const u = h.domain.users.find((x) => x.id === userId)
  if (!u) return null
  const contexts = h.domain.userReputationContexts.filter((c) => c.userId === userId)
  const reputationByContext: Record<string, number> = {}
  for (const c of contexts) {
    reputationByContext[c.contextType] = c.score
  }
  const socialScore = contexts.find((c) => c.contextType === 'social')?.score ?? 4
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    headline: u.headline,
    bio: u.bio ?? null,
    socialScore,
    reputationByContext,
  }
}

export function meUser(h: HydratedFixtures) {
  const base = publicUser(h, h.sessionDefaultUserId)
  if (!base) return null
  const p = h.sessionUserProfile
  if (!p) {
    return { ...base, handle: `@${base.username}` }
  }
  return {
    ...base,
    displayName: p.name ?? base.displayName,
    bio: p.bio ?? base.bio ?? null,
    avatarUrl: p.avatar ?? base.avatarUrl,
    handle: p.handle ?? `@${base.username}`,
  }
}

export function postsByAuthorOrdered(all: SocialPost[], authorId: string): SocialPost[] {
  const filtered = all.filter((p) => p.author.id === authorId)
  return orderPostsForFeed(filtered)
}
