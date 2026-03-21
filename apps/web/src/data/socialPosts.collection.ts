import type { SocialPost } from '@/data/socialPost.types'
import { fixtures } from '@/data/fixtures/loadFixtures'

/**
 * Coleção canónica de postagens (domínio rico), carregada de
 * `fixtures/gwan-social.fixtures.json` — ver `socialPost.types.ts` e `schemaVersion` no JSON.
 */
export const MOCK_SOCIAL_POSTS: SocialPost[] = fixtures.socialPosts

export function orderPostsForFeed(list: SocialPost[]): SocialPost[] {
  return [...list].sort((a, b) => {
    if (a.type === 'featured_moment' && b.type !== 'featured_moment') return -1
    if (b.type === 'featured_moment' && a.type !== 'featured_moment') return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
