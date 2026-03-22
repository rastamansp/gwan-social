/** Modelo de domínio para postagens (feed Nosedive / reputação) — alinhado ao JSON mock da coleção. */

export type SocialPostType = 'featured_moment' | 'feed_post'

export type SocialPostVisibility = 'public' | 'followers' | 'private'

export type SocialPostCategory = 'moments' | 'photos' | string

export interface SocialLocation {
  name: string
  city: string
  country: string
}

export interface SocialAuthor {
  id: string
  name: string
  username: string
  avatarUrl: string
  score: number
  headline: string
}

export interface SocialMedia {
  id: string
  type: 'image' | 'video'
  url: string
  alt: string
}

export interface SocialPostStats {
  views: number
  likes: number
  comments: number
  ratingsCount: number
  shares: number
}

export interface SocialRatingDistribution {
  '1': number
  '2': number
  '3': number
  '4': number
  '5': number
}

export interface SocialHighlightedRating {
  id: string
  reviewer: SocialAuthor
  value: number
  comment: string
  createdAt: string
}

export interface SocialRatingsBlock {
  average: number
  distribution: SocialRatingDistribution
  latestHighlightedRating: SocialHighlightedRating | null
}

export interface SocialCommentPreview {
  id: string
  author: SocialAuthor
  text: string
  createdAt: string
}

export interface SocialPersonRef {
  id: string
  name: string
}

export interface SocialPost {
  id: string
  type: SocialPostType
  content: string
  createdAt: string
  visibility: SocialPostVisibility
  category: SocialPostCategory
  location: SocialLocation
  author: SocialAuthor
  media: SocialMedia[]
  stats: SocialPostStats
  ratings: SocialRatingsBlock
  commentsPreview: SocialCommentPreview[]
  tags: string[]
  people: SocialPersonRef[]
  isTrending: boolean
  isHighestRated: boolean
}

export interface SocialPostsCollection {
  posts: SocialPost[]
}
