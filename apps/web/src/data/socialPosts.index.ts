/**
 * API pública da coleção de postagens (domínio rico).
 * UI legada consome `posts` / `editorialByPostId` em `mockUsers.ts`.
 */
import { MOCK_SOCIAL_POSTS, orderPostsForFeed } from '@/data/socialPosts.collection'
import type { SocialPost } from '@/data/socialPost.types'

export type { SocialPost, SocialPostsCollection } from '@/data/socialPost.types'
export { MOCK_SOCIAL_POSTS, orderPostsForFeed }

export const socialPostsOrdered: SocialPost[] = orderPostsForFeed(MOCK_SOCIAL_POSTS)

export function getSocialPostById(id: string): SocialPost | undefined {
  return MOCK_SOCIAL_POSTS.find((p) => p.id === id)
}

export function getFeaturedSocialPost(): SocialPost | undefined {
  return MOCK_SOCIAL_POSTS.find((p) => p.type === 'featured_moment')
}

export function getTrendingSocialPosts(): SocialPost[] {
  return MOCK_SOCIAL_POSTS.filter((p) => p.isTrending)
}

export function getHighestRatedSocialPosts(): SocialPost[] {
  return MOCK_SOCIAL_POSTS.filter((p) => p.isHighestRated)
}

/** Linhas para a sidebar “Em alta” (perfil): trending por vistas, nota como score. */
export function getTrendingSidebarRows(limit = 5) {
  return getTrendingSocialPosts()
    .sort((a, b) => b.stats.views - a.stats.views)
    .slice(0, limit)
    .map((p) => ({
      postId: p.id,
      label: p.title.length > 48 ? `${p.title.slice(0, 45)}…` : p.title,
      score: p.ratings.average.toFixed(1),
    }))
}

/** Linhas para “Posts mais bem avaliados”: flag `isHighestRated`, ordenados por média. */
export function getHighestRatedSidebarRows(limit = 5) {
  return getHighestRatedSocialPosts()
    .sort((a, b) => b.ratings.average - a.ratings.average)
    .slice(0, limit)
    .map((p) => ({
      postId: p.id,
      title: p.title,
      meta: `${p.stats.ratingsCount} avaliações · média ${p.ratings.average.toFixed(1)}`,
    }))
}
