import type { User } from '@prisma/client'
import type { SocialPost } from '../../types/socialPost.types'
import { orderPostsForFeed } from '../shared/feed-order'

export type PublicProfileDto = {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  headline: string
  bio: string | null
  socialScore: number
  reputationByContext: Record<string, number>
}

export function publicUserFromPrisma(user: User, socialScore: number): PublicProfileDto {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl ?? '',
    headline: user.headline ?? '',
    bio: user.bio ?? null,
    socialScore,
    reputationByContext: { social: socialScore },
  }
}

export function postsByAuthorOrdered(all: SocialPost[], authorId: string): SocialPost[] {
  const filtered = all.filter((p) => p.author.id === authorId)
  return orderPostsForFeed(filtered)
}
