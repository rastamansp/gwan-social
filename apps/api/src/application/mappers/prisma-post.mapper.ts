import type { Comment, Post, PostMedia, Rating, User } from '@prisma/client'
import type {
  SocialAuthor,
  SocialCommentPreview,
  SocialLocation,
  SocialMedia,
  SocialPersonRef,
  SocialPost,
  SocialPostStats,
  SocialPostType,
  SocialPostVisibility,
  SocialRatingsBlock,
} from '../../types/socialPost.types'

export type PostWithFeedRelations = Post & {
  media: PostMedia[]
  comments: (Comment & { author: User })[]
  ratings: (Rating & { reviewer: User })[]
}

export type SocialScoreLookup = (userId: string) => number

export function userIdsForPostScores(
  author: User,
  row: Pick<PostWithFeedRelations, 'comments' | 'ratings'>,
): string[] {
  const ids = new Set<string>()
  ids.add(author.id)
  for (const c of row.comments ?? []) ids.add(c.author.id)
  for (const r of row.ratings ?? []) ids.add(r.reviewer.id)
  return [...ids]
}

function socialAuthorFromPrisma(u: User, getScore: SocialScoreLookup): SocialAuthor {
  return {
    id: u.id,
    name: u.displayName,
    username: u.username,
    avatarUrl: u.avatarUrl ?? '',
    score: getScore(u.id),
    headline: u.headline ?? '',
  }
}

function parseLocation(json: unknown): SocialLocation {
  if (json && typeof json === 'object' && json !== null) {
    const o = json as Record<string, unknown>
    return {
      name: String(o.name ?? ''),
      city: String(o.city ?? ''),
      country: String(o.country ?? ''),
    }
  }
  return { name: '', city: '', country: '' }
}

function parseTags(json: unknown): string[] {
  if (!Array.isArray(json)) return []
  return json.map((x) => String(x))
}

function emptyStats(): SocialPostStats {
  return { views: 0, likes: 0, comments: 0, ratingsCount: 0, shares: 0 }
}

function emptyDistribution(): SocialRatingsBlock['distribution'] {
  return { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
}

function ratingsBlockFromPrisma(
  ratings: (Rating & { reviewer: User })[],
  getScore: SocialScoreLookup,
): SocialRatingsBlock {
  const dist = emptyDistribution()
  let sum = 0
  for (const r of ratings) {
    const k = Math.min(5, Math.max(1, Math.round(r.value))) as 1 | 2 | 3 | 4 | 5
    const key = String(k) as keyof typeof dist
    dist[key] = (dist[key] ?? 0) + 1
    sum += r.value
  }
  const n = ratings.length
  const average = n > 0 ? Math.round((sum / n) * 10) / 10 : 0
  const sorted = [...ratings].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )
  let latestHighlightedRating: SocialRatingsBlock['latestHighlightedRating'] = null
  const pick = sorted.find((r) => r.comment.trim().length > 0 && r.value >= 4) ?? sorted[0]
  if (pick) {
    latestHighlightedRating = {
      id: pick.id,
      reviewer: socialAuthorFromPrisma(pick.reviewer, getScore),
      value: pick.value,
      comment: pick.comment,
      createdAt: pick.createdAt.toISOString(),
    }
  }
  return { average, distribution: dist, latestHighlightedRating }
}

function asPostType(raw: string): SocialPostType {
  return raw === 'featured_moment' || raw === 'feed_post' ? raw : 'feed_post'
}

function asVisibility(raw: string): SocialPostVisibility {
  return raw === 'public' || raw === 'followers' || raw === 'private' ? raw : 'public'
}

function mediaFromRow(media: PostMedia[]): SocialMedia[] {
  return media.map((m) => ({
    id: m.id,
    type: m.type === 'video' ? 'video' : 'image',
    url: m.url,
    alt: m.alt ?? '',
  }))
}

function commentsPreviewFromRow(
  comments: (Comment & { author: User })[],
  getScore: SocialScoreLookup,
): SocialCommentPreview[] {
  return comments.map((c) => ({
    id: c.id,
    author: socialAuthorFromPrisma(c.author, getScore),
    text: c.text,
    createdAt: c.createdAt.toISOString(),
  }))
}

/** Constrói `SocialPost` a partir de uma linha Prisma. */
export function socialPostFromPrisma(
  row: PostWithFeedRelations,
  author: User,
  getScore: SocialScoreLookup,
): SocialPost {
  const ratings = row.ratings ?? []
  const comments = row.comments ?? []
  const stats: SocialPostStats = {
    ...emptyStats(),
    comments: comments.length,
    ratingsCount: ratings.length,
  }

  return {
    id: row.id,
    type: asPostType(row.type),
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    visibility: asVisibility(row.visibility),
    category: row.category,
    location: parseLocation(row.location),
    author: socialAuthorFromPrisma(author, getScore),
    media: mediaFromRow(row.media ?? []),
    stats,
    ratings: ratingsBlockFromPrisma(ratings, getScore),
    commentsPreview: commentsPreviewFromRow(comments, getScore),
    tags: parseTags(row.tags),
    people: [] as SocialPersonRef[],
    isTrending: row.isTrending,
    isHighestRated: row.isHighestRated,
  }
}
