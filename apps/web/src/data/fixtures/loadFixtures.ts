import type { ProfileRatedEntry } from '@/data/fixture-types'
import type { FixtureDomain } from '@/data/fixtures/fixtureDomain.types'
import type { SocialPost } from '@/data/socialPost.types'
import {
  type GwanSocialFixtureV2Raw,
  type LegacyGwanSocialFixtureV1,
  type RawGwanFixture,
  hydrateRawFixture,
} from '@/data/fixtures/hydrateFixtures'

import raw from './gwan-social.fixtures.json'

const hydrated = hydrateRawFixture(raw as RawGwanFixture)

/**
 * Contrato público dos fixtures (UI + demo).
 * O domínio normalizado está em `hydrated.domain` e `schemaVersion` no JSON.
 */
export interface GwanSocialFixtures {
  schemaVersion: number
  /** Domínio normalizado (schemaVersion >= 2 no ficheiro; v1 converte-se em memória). */
  domain: FixtureDomain
  /** Read model para cartões de feed / detalhe de post. */
  socialPosts: SocialPost[]
  profile: {
    ratedEntries: ProfileRatedEntry[]
    friendUserIds: string[]
  }
  sessionDefaultUserId: string
  sessionUserProfile?: LegacyGwanSocialFixtureV1['sessionUserProfile']
  ui: LegacyGwanSocialFixtureV1['ui'] & {
    profileDashboardStats: {
      photos: number
      rated: number
      friendsLabel: string
    }
    sidebarReputationContext: [string, string][]
    featuredMomentRating: {
      extraRatingsLabel: string
      filledStars: number
      quote: string
    }
    feedPostIdsBelowHero: string[]
    nearbyPostDistances: { postId: string; distanceKm: number }[]
    fallbackEditorialImages: {
      main: string
      side: string
      avatarFallback: string
    }
  }
}

export const fixtures: GwanSocialFixtures = {
  schemaVersion: (raw as { schemaVersion: number }).schemaVersion,
  domain: hydrated.domain,
  socialPosts: hydrated.socialPosts,
  profile: {
    ratedEntries: hydrated.profileRatedEntries,
    friendUserIds: hydrated.sessionFriendUserIds,
  },
  sessionDefaultUserId: hydrated.sessionDefaultUserId,
  sessionUserProfile: hydrated.sessionUserProfile,
  ui: hydrated.ui as GwanSocialFixtures['ui'],
}

export type { FixtureDomain, GwanSocialFixtureV2Raw, LegacyGwanSocialFixtureV1, RawGwanFixture }
