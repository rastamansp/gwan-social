import type { User } from '@prisma/client'
import { publicUser } from '../application/mappers/profile.mappers'
import type { HydratedFixtures } from '../infrastructure/fixtures/hydrateFixtures'

/** Formato alinhado a `GET /me` / `ApiMeUserDto` na web. */
export type MeUserJson = {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  headline: string
  bio: string | null
  socialScore: number
  reputationByContext: Record<string, number>
  handle: string
}

export function buildMeUserDtoFromPrisma(user: User, h: HydratedFixtures): MeUserJson {
  const pu = publicUser(h, user.id)
  if (pu) {
    return {
      ...pu,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: (user.avatarUrl ?? pu.avatarUrl) ?? '',
      headline: (user.headline ?? pu.headline) ?? '',
      bio: user.bio ?? pu.bio ?? null,
      handle: `@${user.username}`,
    }
  }
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl ?? '',
    headline: user.headline ?? '',
    bio: user.bio ?? null,
    socialScore: 4,
    reputationByContext: {},
    handle: `@${user.username}`,
  }
}
