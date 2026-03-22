import type { User } from '@prisma/client'
import { publicUserFromPrisma } from '../application/mappers/profile.mappers'

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
  email: string | null
}

export function buildMeUserDtoFromPrisma(user: User, socialScore: number): MeUserJson {
  const pu = publicUserFromPrisma(user, socialScore)
  return {
    ...pu,
    handle: `@${user.username}`,
    email: user.email ?? null,
  }
}
