/**
 * API pública da coleção de postagens (domínio rico).
 * UI legada consome `posts` / `editorialByPostId` em `mockUsers.ts`.
 */
import type { EditorialPost } from '@/data/legacyFeed.types'
import { fixtures } from '@/data/fixtures/loadFixtures'
import { MOCK_SOCIAL_POSTS, orderPostsForFeed } from '@/data/socialPosts.collection'
import type { SocialPost } from '@/data/socialPost.types'

const { avatarFallback: AVATAR_FALLBACK } = fixtures.ui.fallbackEditorialImages

/** Pessoa em destaque na sidebar de avaliações (rotação opcional na página do post). */
export type RatingSpotlightPerson = EditorialPost['sideRating']['person']

/**
 * Lista para alternar na UI: avaliação em destaque + autores dos comentários de pré-visualização (sem duplicar por id).
 */
export function getRatingSpotlightPeople(sp: SocialPost): RatingSpotlightPerson[] {
  const out: RatingSpotlightPerson[] = []
  const seen = new Set<string>()
  const push = (person: RatingSpotlightPerson, key: string) => {
    if (seen.has(key)) return
    seen.add(key)
    out.push(person)
  }

  const hi = sp.ratings.latestHighlightedRating
  if (hi) {
    push(
      {
        name: hi.reviewer.name,
        rating: hi.reviewer.score.toFixed(1),
        avatar: hi.reviewer.avatarUrl || AVATAR_FALLBACK,
      },
      hi.reviewer.id,
    )
  }

  for (const c of sp.commentsPreview) {
    push(
      {
        name: c.author.name,
        rating: c.author.score.toFixed(1),
        avatar: c.author.avatarUrl || AVATAR_FALLBACK,
      },
      c.author.id,
    )
  }

  if (out.length === 0) {
    push({ name: '—', rating: '—', avatar: AVATAR_FALLBACK }, 'empty')
  }

  return out
}

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
