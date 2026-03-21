import type { UserProfile } from '@/data/legacyFeed.types'
import type { ProfileRatedEntry } from '@/data/fixture-types'
import { fixtures } from '@/data/fixtures/loadFixtures'

export type { ProfileRatedEntry }

/** Avaliações recebidas pelo utilizador do perfil mock (ex.: Lacie) — posts ou perfil. */
export const profileRatedEntries: ProfileRatedEntry[] = fixtures.profile.ratedEntries

export function buildProfileFriendsList(
  allUsers: UserProfile[],
  currentUserId: string,
): UserProfile[] {
  return fixtures.profile.friendUserIds
    .map((id) => allUsers.find((u) => u.id === id))
    .filter((u): u is UserProfile => Boolean(u && u.id !== currentUserId))
}
