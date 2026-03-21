import type { EditorialPost, Post, UserProfile } from '@/data/legacyFeed.types'
import type { FixtureDomain, FixtureUser } from '@/data/fixtures/fixtureDomain.types'
import type { SocialAuthor, SocialPost } from '@/data/socialPost.types'
import { fixtures } from '@/data/fixtures/loadFixtures'

const { main: IMG_MAIN, side: IMG_SIDE, avatarFallback: AVATAR_FALLBACK } =
  fixtures.ui.fallbackEditorialImages

function scoreToTier(score: number): UserProfile['tier'] {
  if (score >= 4.5) return 'elite'
  if (score >= 4.0) return 'premium'
  if (score >= 3.0) return 'standard'
  return 'low'
}

/** ISO → texto relativo simples (mock UI). */
export function formatRelativeTime(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Agora há pouco'
  if (h < 24) return `${h}h atrás`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}d atrás`
  return d.toLocaleDateString('pt-BR')
}

function tripleImages(sp: SocialPost): [string, string, string] {
  const urls = sp.media.filter((m) => m.type === 'image').map((m) => m.url)
  const a = urls[0] ?? IMG_MAIN
  const b = urls[1] ?? urls[0] ?? IMG_SIDE
  const c = urls[2] ?? urls[1] ?? urls[0] ?? IMG_SIDE
  return [a, b, c]
}

export function socialPostToEditorial(sp: SocialPost): EditorialPost {
  const hi = sp.ratings.latestHighlightedRating
  const comments =
    sp.commentsPreview.length > 0
      ? sp.commentsPreview.map((c) => ({ author: c.author.name, text: c.text }))
      : [{ author: 'Comunidade', text: 'Ainda sem comentários neste mock.' }]

  const peopleLabel =
    sp.people.length > 0
      ? `Pessoas ${sp.people.map((p) => p.name).join(', ')}`
      : `Pessoas ${sp.author.name}`

  return {
    id: sp.id,
    user: {
      name: sp.author.name,
      rating: sp.author.score.toFixed(3),
      avatar: sp.author.avatarUrl || AVATAR_FALLBACK,
    },
    title: sp.title,
    images: tripleImages(sp),
    taggedPeople: peopleLabel,
    sideRating: {
      count: sp.stats.ratingsCount,
      person: hi
        ? {
            name: hi.reviewer.name,
            rating: hi.reviewer.score.toFixed(1),
            avatar: hi.reviewer.avatarUrl || AVATAR_FALLBACK,
          }
        : {
            name: '—',
            rating: '—',
            avatar: AVATAR_FALLBACK,
          },
    },
    comments,
  }
}

export function socialPostToLegacyPost(sp: SocialPost): Post {
  return {
    id: sp.id,
    userId: sp.author.id,
    content: sp.description,
    image: sp.media[0]?.url,
    likes: sp.stats.likes,
    timestamp: formatRelativeTime(sp.createdAt),
    rating: sp.ratings.average,
  }
}

export function socialAuthorToUserProfile(a: SocialAuthor): UserProfile {
  return {
    id: a.id,
    name: a.name,
    handle: `@${a.username}`,
    avatar: a.avatarUrl || AVATAR_FALLBACK,
    rating: a.score,
    ratingCount: Math.max(50, Math.round(a.score * 420)),
    bio: a.headline,
    tier: scoreToTier(a.score),
  }
}

/** Utilizador do fixture normalizado → perfil de UI (reputação no contexto `social`). */
export function userProfileFromFixtureUser(u: FixtureUser, domain: FixtureDomain): UserProfile {
  const score =
    domain.userReputationContexts.find((c) => c.userId === u.id && c.contextType === 'social')
      ?.score ?? 4
  return socialAuthorToUserProfile({
    id: u.id,
    name: u.displayName,
    username: u.username,
    avatarUrl: u.avatarUrl,
    score,
    headline: u.bio ?? u.headline,
  })
}

function collectAuthors(sp: SocialPost): SocialAuthor[] {
  const list: SocialAuthor[] = [sp.author]
  const hi = sp.ratings.latestHighlightedRating
  if (hi) list.push(hi.reviewer)
  for (const c of sp.commentsPreview) list.push(c.author)
  return list
}

export function uniqueAuthorsFromPosts(posts: SocialPost[]): SocialAuthor[] {
  const map = new Map<string, SocialAuthor>()
  for (const sp of posts) {
    for (const a of collectAuthors(sp)) {
      if (!map.has(a.id)) map.set(a.id, a)
    }
  }
  return [...map.values()]
}
