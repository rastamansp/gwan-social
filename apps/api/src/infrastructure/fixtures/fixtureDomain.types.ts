import type {
  SocialPostStats,
  SocialRatingsBlock,
  SocialPostType,
  SocialPostVisibility,
  SocialPostCategory,
  SocialLocation,
} from '../../types/socialPost.types'

export type ReputationContextType = 'social' | 'professional' | 'events' | 'trust' | string

export interface FixtureUser {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  headline: string
  bio?: string
  createdAt?: string
}

export interface FixturePost {
  id: string
  authorId: string
  type: SocialPostType
  title: string
  description: string
  createdAt: string
  visibility: SocialPostVisibility
  category: SocialPostCategory
  location: SocialLocation
  tags?: string[]
  isTrending?: boolean
  isHighestRated?: boolean
}

export interface FixturePostMedia {
  id: string
  postId: string
  type: 'image' | 'video'
  url: string
  alt: string
  position: number
}

export interface FixturePostMention {
  postId: string
  userId: string
}

export interface FixtureComment {
  id: string
  postId: string
  authorId: string
  text: string
  createdAt: string
}

export type RatingContextType = string

export interface FixtureRating {
  id: string
  reviewerId: string
  revieweeId: string
  postId: string | null
  value: number
  comment: string
  createdAt: string
  contextType: RatingContextType
  interactionId: string | null
}

export type FriendshipStatus = 'accepted' | 'pending' | 'blocked'

export interface FixtureFriendship {
  userId: string
  friendUserId: string
  status: FriendshipStatus
}

export type InteractionStatus = 'completed' | 'pending' | 'void'

export interface FixtureInteraction {
  id: string
  actorUserId: string
  targetUserId: string
  type: string
  referenceType: string
  referenceId: string
  occurredAt: string
  status: InteractionStatus
}

export interface FixtureUserReputationContext {
  userId: string
  contextType: ReputationContextType
  score: number
  ratingsCount?: number
}

export interface FixturePostEngagementSnapshot {
  stats: SocialPostStats
  ratings: SocialRatingsBlock
}

export interface FixtureDomain {
  users: FixtureUser[]
  posts: FixturePost[]
  postMedia: FixturePostMedia[]
  postMentions: FixturePostMention[]
  comments: FixtureComment[]
  ratings: FixtureRating[]
  friendships: FixtureFriendship[]
  interactions: FixtureInteraction[]
  userReputationContexts: FixtureUserReputationContext[]
  postEngagementSnapshots?: Record<string, FixturePostEngagementSnapshot>
}
