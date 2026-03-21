import type { UserProfile } from '@/data/legacyFeed.types'
import { scoreToTier } from '@/data/socialPosts.adapters'

/** DTO público devolvido por `GET /users/:id`. */
export interface ApiPublicUserDto {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  headline: string
  bio: string | null
  socialScore: number
  reputationByContext: Record<string, number>
}

/** DTO de `GET /me` (inclui handle). */
export interface ApiMeUserDto extends ApiPublicUserDto {
  handle: string
}

function ratingCountFromScore(score: number): number {
  return Math.max(50, Math.round(score * 420))
}

export function mapApiPublicUserToProfile(dto: ApiPublicUserDto): UserProfile {
  const rating = dto.socialScore
  return {
    id: dto.id,
    name: dto.displayName,
    handle: `@${dto.username}`,
    avatar: dto.avatarUrl,
    rating,
    ratingCount: ratingCountFromScore(rating),
    bio: dto.bio?.trim() ? dto.bio : dto.headline,
    tier: scoreToTier(rating),
  }
}

export function mapApiMeUserToProfile(dto: ApiMeUserDto): UserProfile {
  const base = mapApiPublicUserToProfile(dto)
  return {
    ...base,
    handle: dto.handle.startsWith('@') ? dto.handle : `@${dto.handle.replace(/^@+/, '')}`,
    name: dto.displayName,
    bio: dto.bio?.trim() ? dto.bio : dto.headline,
  }
}
