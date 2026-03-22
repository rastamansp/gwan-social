import type { SocialPost } from '../../types/socialPost.types'

/** Ordenação do feed: momento em destaque primeiro, depois por data. */
export function orderPostsForFeed(list: SocialPost[]): SocialPost[] {
  return [...list].sort((a, b) => {
    if (a.type === 'featured_moment' && b.type !== 'featured_moment') return -1
    if (b.type === 'featured_moment' && a.type !== 'featured_moment') return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
