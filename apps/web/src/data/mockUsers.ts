export type { EditorialPost, Post, UserProfile } from '@/data/legacyFeed.types'
export type { ProfileRatedEntry } from '@/data/profileTabMocks'
export { buildProfileFriendsList, profileRatedEntries } from '@/data/profileTabMocks'

import type { FixtureDomain } from '@/data/fixtures/fixtureDomain.types'
import type { EditorialPost, Post, UserProfile } from '@/data/legacyFeed.types'
import { fixtures } from '@/data/fixtures/loadFixtures'
import { MOCK_SOCIAL_POSTS, orderPostsForFeed } from '@/data/socialPosts.collection'
import {
  socialPostToEditorial,
  socialPostToLegacyPost,
  userProfileFromFixtureUser,
} from '@/data/socialPosts.adapters'

const { main: IMG_MAIN, side: IMG_SIDE } = fixtures.ui.fallbackEditorialImages

/** Ordem do feed: destaque editorial primeiro, depois por data. */
export const socialFeedPostsOrdered = orderPostsForFeed(MOCK_SOCIAL_POSTS)

/** Lista plana para `PostCard`, `PostPage`, `FeedPostList` (camada legada). */
export const posts: Post[] = socialFeedPostsOrdered.map(socialPostToLegacyPost)

function countAcceptedFriends(domain: FixtureDomain, userId: string): number {
  return domain.friendships.filter(
    (f) =>
      f.status === 'accepted' && (f.userId === userId || f.friendUserId === userId),
  ).length
}

/** Perfis a partir do catálogo normalizado de utilizadores + reputação por contexto. */
export const users: UserProfile[] = (() => {
  const list = fixtures.domain.users.map((u) => userProfileFromFixtureUser(u, fixtures.domain))
  const patch = fixtures.sessionUserProfile
  if (!patch) return list
  return list.map((u) =>
    u.id === fixtures.sessionDefaultUserId ? { ...u, ...patch } : u,
  )
})()

/** Utilizador “eu” no mock — id em `fixtures.sessionDefaultUserId`. */
export const currentUser =
  users.find((u) => u.id === fixtures.sessionDefaultUserId) ?? users[0]

/** Mapa editorial por id (Nosedive) — gerado a partir da coleção rica. */
export const editorialByPostId: Record<string, EditorialPost> = Object.fromEntries(
  socialFeedPostsOrdered.map((p) => [p.id, socialPostToEditorial(p)]),
)

/** Estatísticas do cartão de perfil (feed estilo Nosedive — mock). */
export const profileDashboardStats = { ...fixtures.ui.profileDashboardStats }

export type ProfileDashboardStats = {
  photos: number
  rated: number
  friendsLabel: string
}

/** Métricas do cabeçalho do perfil: “eu” usa `profileDashboardStats`; outros derivam do domínio. */
export function getProfileDashboardStatsForUser(userId: string): ProfileDashboardStats {
  if (userId === currentUser.id) return { ...profileDashboardStats }
  const d = fixtures.domain
  const userPostIds = new Set(d.posts.filter((p) => p.authorId === userId).map((p) => p.id))
  const photoPosts = [...userPostIds].filter((pid) =>
    d.postMedia.some((m) => m.postId === pid && m.type === 'image'),
  ).length
  const ratedReceived = d.ratings.filter((r) => r.revieweeId === userId).length
  const nFriends = countAcceptedFriends(d, userId)
  return {
    photos: Math.max(photoPosts * 20 + 40, photoPosts || 8),
    rated: Math.max(ratedReceived, 8),
    friendsLabel: nFriends >= 1000 ? `${(nFriends / 1000).toFixed(1)}k` : String(Math.max(nFriends, 1)),
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

export const sidebarReputationContext = fixtures.ui.sidebarReputationContext

/** Destaque ao lado do hero (avaliação mock). */
export const featuredMomentRating = { ...fixtures.ui.featuredMomentRating }

/** Postagens mostradas logo abaixo do bloco do hero (ids da coleção social). */
export const FEED_POST_IDS_BELOW_HERO = fixtures.ui.feedPostIdsBelowHero as readonly string[]

/** Postagens de pessoas próximas (mock — sem geolocalização real). */
export const nearbyPostIds = fixtures.ui.nearbyPostDistances

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
    taggedPeople: `Pessoas ${author.name}`,
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
