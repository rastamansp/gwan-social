/** Subconjunto tipado do domínio em gwan-social.fixtures.json (schemaVersion 2). */

export type DomainUser = {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
  headline?: string
}

export type DomainPost = {
  id: string
  authorId: string
  type: string
  title: string
  description: string
  createdAt: string
  visibility: string
  category: string
  location?: { name: string; city: string; country: string }
  tags: string[]
  isTrending: boolean
  isHighestRated: boolean
}

export type DomainPostMedia = {
  id: string
  postId: string
  type: string
  url: string
  alt?: string
  position: number
}

export type DomainComment = {
  id: string
  postId: string
  authorId: string
  text: string
  createdAt: string
}

export type DomainRating = {
  id: string
  reviewerId: string
  revieweeId: string
  postId: string | null
  value: number
  comment: string
  createdAt: string
  contextType: string
  interactionId?: string | null
}

export type DomainFriendship = {
  userId: string
  friendUserId: string
  status: string
}

export type DomainPostMention = {
  postId: string
  userId: string
}

export type FixtureDomain = {
  users: DomainUser[]
  posts: DomainPost[]
  postMedia: DomainPostMedia[]
  comments: DomainComment[]
  ratings: DomainRating[]
  friendships: DomainFriendship[]
  postMentions: DomainPostMention[]
}

export type FixturesFile = {
  schemaVersion: number
  domain: FixtureDomain
}
