import type { EditorialPost, Post, UserProfile } from '@/data/legacyFeed.types'
import type { SocialAuthor, SocialPost } from '@/data/socialPost.types'
import { AVATAR_FALLBACK } from '@/data/ui-constants'

export function scoreToTier(score: number): UserProfile['tier'] {
  if (score >= 4.5) return 'elite'
  if (score >= 4.0) return 'premium'
  if (score >= 3.0) return 'standard'
  return 'low'
}

/** Texto da linha “N pessoa(s) avaliaram esta foto” (sidebar do post). */
export function ratingsCountLabelPt(count: number): string {
  const n = Math.max(0, Math.floor(Number(count)))
  if (n === 1) return '1 pessoa avaliou esta foto'
  return `${n} pessoas avaliaram esta foto`
}

/** ISO → «20 de março às 16:00» (hora local do dispositivo). */
export function formatPublishedDateTimePt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const monthsPt = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ] as const
  const day = d.getDate()
  const month = monthsPt[d.getMonth()]
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${day} de ${month} às ${hh}:${mm}`
}

/** ISO → texto relativo simples (UI). */
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

/** URLs reais das imagens do post (ordem de `media`); sem padding com a mesma URL. */
function editorialImageUrls(sp: SocialPost): string[] {
  return sp.media.filter((m) => m.type === 'image' && m.url.trim()).map((m) => m.url)
}

export function socialPostToEditorial(sp: SocialPost): EditorialPost {
  const hi = sp.ratings.latestHighlightedRating
  const comments =
    sp.commentsPreview.length > 0
      ? sp.commentsPreview.map((c) => ({ author: c.author.name, text: c.text }))
      : [{ author: 'Comunidade', text: 'Ainda sem comentários.' }]

  const peopleLabel =
    sp.people.length > 0
      ? `Pessoas ${sp.people.map((p) => p.name).join(', ')}`
      : `Pessoas ${sp.author.name}`

  return {
    id: sp.id,
    authorUserId: sp.author.id,
    user: {
      name: sp.author.name,
      rating: sp.author.score.toFixed(3),
      avatar: sp.author.avatarUrl?.trim() || AVATAR_FALLBACK,
    },
    content: sp.content,
    images: editorialImageUrls(sp),
    publishedAtLabel: formatPublishedDateTimePt(sp.createdAt),
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
    content: sp.content,
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
    headline: a.headline ?? '',
    bio: '',
    tier: scoreToTier(a.score),
  }
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
