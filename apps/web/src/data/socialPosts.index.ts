/**
 * Consultas sobre `SocialPost` (ex.: spotlight na página do post).
 */
import type { EditorialPost } from '@/data/legacyFeed.types'
import type { SocialPost } from '@/data/socialPost.types'
import { AVATAR_FALLBACK } from '@/data/ui-constants'

export { orderPostsForFeed } from '@/data/feed-order'

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
