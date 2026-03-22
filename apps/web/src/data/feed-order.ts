import type { SocialPost } from '@/data/socialPost.types'

export function orderPostsForFeed(list: SocialPost[]): SocialPost[] {
  return [...list].sort((a, b) => {
    if (a.type === 'featured_moment' && b.type !== 'featured_moment') return -1
    if (b.type === 'featured_moment' && a.type !== 'featured_moment') return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
