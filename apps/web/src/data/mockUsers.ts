export type { EditorialPost, Post, UserProfile } from '@/data/legacyFeed.types'
export type { ProfileRatedEntry } from '@/data/profileTabMocks'
export { buildProfileFriendsList, profileRatedEntries } from '@/data/profileTabMocks'

import type { EditorialPost, Post, UserProfile } from '@/data/legacyFeed.types'
import { MOCK_SOCIAL_POSTS, orderPostsForFeed } from '@/data/socialPosts.collection'
import {
  socialAuthorToUserProfile,
  socialPostToEditorial,
  socialPostToLegacyPost,
  uniqueAuthorsFromPosts,
} from '@/data/socialPosts.adapters'

const IMG_MAIN =
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop'
const IMG_SIDE =
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop'

/** Ordem do feed: destaque editorial primeiro, depois por data. */
export const socialFeedPostsOrdered = orderPostsForFeed(MOCK_SOCIAL_POSTS)

/** Lista plana para `PostCard`, `PostPage`, `FeedPostList` (camada legada). */
export const posts: Post[] = socialFeedPostsOrdered.map(socialPostToLegacyPost)

/** Perfis derivados dos autores + comentadores da coleção social. */
export const users: UserProfile[] = uniqueAuthorsFromPosts(MOCK_SOCIAL_POSTS).map(
  socialAuthorToUserProfile,
)

/** Utilizador “eu” no mock (Lacie / post em destaque). */
export const currentUser =
  users.find((u) => u.id === 'user_001') ?? users[0]

/** Mapa editorial por id (Nosedive) — gerado a partir da coleção rica. */
export const editorialByPostId: Record<string, EditorialPost> = Object.fromEntries(
  socialFeedPostsOrdered.map((p) => [p.id, socialPostToEditorial(p)]),
)

/** Estatísticas do cartão de perfil (feed estilo Nosedive — mock). */
export const profileDashboardStats = {
  photos: 128,
  rated: 534,
  friendsLabel: '2.4k',
} as const

export type ProfileDashboardStats = {
  photos: number
  rated: number
  friendsLabel: string
}

/** Métricas do cabeçalho do perfil: “eu” usa `profileDashboardStats`; outros derivam da coleção social. */
export function getProfileDashboardStatsForUser(userId: string): ProfileDashboardStats {
  if (userId === currentUser.id) return { ...profileDashboardStats }
  const social = MOCK_SOCIAL_POSTS.filter((p) => p.author.id === userId)
  const photoPosts = social.filter((p) => p.media.some((m) => m.type === 'image')).length
  const rated = social.reduce((s, p) => s + p.stats.ratingsCount, 0)
  const tail = userId.match(/\d+/)?.[0] ?? '3'
  const n = Number.parseInt(tail, 10) % 6
  return {
    photos: Math.max(photoPosts * 22 + 48, 12),
    rated: Math.max(rated + 18, 10),
    friendsLabel: `${(1.0 + n * 0.12).toFixed(1)}k`,
  }
}

/** Posts legados do autor, na ordem global do feed. */
export function getLegacyPostsByUserId(userId: string): Post[] {
  return posts.filter((p) => p.userId === userId)
}

/**
 * Posts do perfil: momento em destaque primeiro (se existir), depois por data decrescente.
 * Garante lista completa no separador Momentos (não só a ordem misturada do feed global).
 */
export function getProfilePostsForUser(userId: string): Post[] {
  const filtered = MOCK_SOCIAL_POSTS.filter((p) => p.author.id === userId)
  const sorted = [...filtered].sort((a, b) => {
    if (a.type === 'featured_moment' && b.type !== 'featured_moment') return -1
    if (b.type === 'featured_moment' && a.type !== 'featured_moment') return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  const byId = new Map(posts.map((p) => [p.id, p]))
  return sorted.map((sp) => byId.get(sp.id)).filter((p): p is Post => p != null)
}

export const sidebarReputationContext = [
  ['Social', '4.9'],
  ['Profissional', '4.6'],
  ['Eventos', '4.8'],
  ['Confiança', '4.7'],
] as const

/** Destaque ao lado do hero (avaliação mock). */
export const featuredMomentRating = {
  extraRatingsLabel: '+19 avaliações',
  filledStars: 2,
  quote:
    'Incrível, belo momento. Adorei a atmosfera e as conexões. Definitivamente inesquecível.',
} as const

/** Postagens mostradas logo abaixo do bloco do hero (ids da coleção social). */
export const FEED_POST_IDS_BELOW_HERO = ['post_005', 'post_006'] as const

/** Postagens de pessoas próximas (mock — sem geolocalização real). */
export const nearbyPostIds: { postId: string; distanceKm: number }[] = [
  { postId: 'post_001', distanceKm: 0.35 },
  { postId: 'post_002', distanceKm: 0.62 },
  { postId: 'post_004', distanceKm: 1.05 },
  { postId: 'post_003', distanceKm: 1.8 },
  { postId: 'post_005', distanceKm: 2.4 },
]

export function getNearbyPosts(): { post: Post; distanceKm: number }[] {
  return nearbyPostIds
    .map(({ postId, distanceKm }) => {
      const post = posts.find((p) => p.id === postId)
      return post ? { post, distanceKm } : null
    })
    .filter((x): x is { post: Post; distanceKm: number } => x !== null)
}

export function getTierColor(tier: UserProfile['tier']) {
  switch (tier) {
    case 'elite':
      return 'text-rating-gold'
    case 'premium':
      return 'text-primary'
    case 'standard':
      return 'text-muted-foreground'
    case 'low':
      return 'text-rating-low'
  }
}

export function getTierLabel(tier: UserProfile['tier']) {
  switch (tier) {
    case 'elite':
      return 'Elite'
    case 'premium':
      return 'Premium'
    case 'standard':
      return 'Padrão'
    case 'low':
      return 'Baixo'
  }
}

export function getEditorialForPost(postId: string): EditorialPost | null {
  return editorialByPostId[postId] ?? null
}

/** Fallback quando não existe entrada editorial (ex.: dados vindos só da API). */
export function buildFallbackEditorial(
  post: Post,
  author: UserProfile,
  viewer: UserProfile = currentUser,
): EditorialPost {
  const title =
    post.content.length > 80 ? `${post.content.slice(0, 77)}...` : post.content
  return {
    id: post.id,
    user: {
      name: author.name,
      rating: author.rating.toFixed(1),
      avatar: author.avatar,
    },
    title,
    images: [IMG_MAIN, IMG_SIDE, IMG_SIDE],
    taggedPeople: `People ${author.name}`,
    sideRating: {
      count: author.ratingCount,
      person: {
        name: viewer.name,
        rating: viewer.rating.toFixed(1),
        avatar: viewer.avatar,
      },
    },
    comments: [
      { author: 'Comunidade', text: 'Avaliações aparecerão aqui quando a API estiver ativa.' },
    ],
  }
}
