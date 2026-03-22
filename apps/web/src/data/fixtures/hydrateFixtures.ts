import type { ProfileRatedEntry } from '@/data/fixture-types'
import type {
  SocialAuthor,
  SocialCommentPreview,
  SocialPersonRef,
  SocialPost,
  SocialPostStats,
  SocialRatingsBlock,
} from '@/data/socialPost.types'
import type {
  FixtureComment,
  FixtureDomain,
  FixturePost,
  FixturePostEngagementSnapshot,
  FixturePostMedia,
  FixtureRating,
  FixtureUser,
} from '@/data/fixtures/fixtureDomain.types'
import { mergedPostBody } from '@/lib/merge-post-body'

/** Fixture bruto v1 (antes da normalização). */
export interface LegacyGwanSocialFixtureV1 {
  schemaVersion: 1
  socialPosts: SocialPost[]
  profile: {
    ratedEntries: ProfileRatedEntry[]
    friendUserIds: string[]
  }
  sessionDefaultUserId: string
  sessionUserProfile?: {
    name?: string
    handle?: string
    bio?: string
    avatar?: string
  }
  ui: unknown
}

export interface GwanSocialFixtureV2Raw {
  schemaVersion: 2
  domain: FixtureDomain
  sessionDefaultUserId: string
  sessionUserProfile?: LegacyGwanSocialFixtureV1['sessionUserProfile']
  ui: LegacyGwanSocialFixtureV1['ui']
}

export type RawGwanFixture = LegacyGwanSocialFixtureV1 | GwanSocialFixtureV2Raw

export interface HydratedFixtures {
  domain: FixtureDomain
  socialPosts: SocialPost[]
  profileRatedEntries: ProfileRatedEntry[]
  /** Amigos aceites do utilizador da sessão (o outro id em cada par). */
  sessionFriendUserIds: string[]
  sessionDefaultUserId: string
  sessionUserProfile?: LegacyGwanSocialFixtureV1['sessionUserProfile']
  ui: LegacyGwanSocialFixtureV1['ui']
}

function emptyStats(): SocialPostStats {
  return { views: 0, likes: 0, comments: 0, ratingsCount: 0, shares: 0 }
}

function emptyDistribution(): SocialRatingsBlock['distribution'] {
  return { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
}

function toSocialAuthor(u: FixtureUser, socialScore: number): SocialAuthor {
  return {
    id: u.id,
    name: u.displayName,
    username: u.username,
    avatarUrl: u.avatarUrl,
    score: socialScore,
    headline: u.headline,
  }
}

function socialScoreForUser(
  userId: string,
  domain: FixtureDomain,
  fallback = 4.0,
): number {
  const ctx = domain.userReputationContexts.find(
    (c) => c.userId === userId && c.contextType === 'social',
  )
  return ctx?.score ?? fallback
}

function buildUserMap(domain: FixtureDomain): Map<string, FixtureUser> {
  return new Map(domain.users.map((u) => [u.id, u]))
}

function commentsPreviewForPost(
  postId: string,
  domain: FixtureDomain,
  userById: Map<string, FixtureUser>,
): SocialCommentPreview[] {
  const list = domain.comments
    .filter((c) => c.postId === postId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return list.map((c) => {
    const u = userById.get(c.authorId)
    if (!u) {
      throw new Error(`[fixtures] Comentário ${c.id}: autor ${c.authorId} em falta`)
    }
    return {
      id: c.id,
      author: toSocialAuthor(u, socialScoreForUser(c.authorId, domain)),
      text: c.text,
      createdAt: c.createdAt,
    }
  })
}

function peopleForPost(
  postId: string,
  domain: FixtureDomain,
  userById: Map<string, FixtureUser>,
): SocialPersonRef[] {
  const ids = domain.postMentions.filter((m) => m.postId === postId).map((m) => m.userId)
  return ids.map((id) => {
    const u = userById.get(id)
    if (!u) throw new Error(`[fixtures] Menção: utilizador ${id} em falta`)
    return { id: u.id, name: u.displayName }
  })
}

function ratingsBlockForPost(
  postId: string,
  domain: FixtureDomain,
  userById: Map<string, FixtureUser>,
  snapshot?: FixturePostEngagementSnapshot,
): SocialRatingsBlock {
  if (snapshot) {
    const hi = snapshot.ratings.latestHighlightedRating
    if (hi) {
      const rev = userById.get(hi.reviewer.id)
      const expanded = rev
        ? {
            ...hi,
            reviewer: toSocialAuthor(rev, socialScoreForUser(rev.id, domain)),
          }
        : hi
      return { ...snapshot.ratings, latestHighlightedRating: expanded }
    }
    return snapshot.ratings
  }

  const postRatings = domain.ratings.filter((r) => r.postId === postId)
  const dist = emptyDistribution()
  let sum = 0
  for (const r of postRatings) {
    const k = Math.min(5, Math.max(1, Math.round(r.value))) as 1 | 2 | 3 | 4 | 5
    const key = String(k) as keyof typeof dist
    dist[key] = (dist[key] ?? 0) + 1
    sum += r.value
  }
  const n = postRatings.length
  const average = n > 0 ? Math.round((sum / n) * 10) / 10 : 0

  const sorted = [...postRatings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  let latestHighlightedRating: SocialRatingsBlock['latestHighlightedRating'] = null
  const pick = sorted.find((r) => r.comment.trim().length > 0 && r.value >= 4) ?? sorted[0]
  if (pick) {
    const rev = userById.get(pick.reviewerId)
    if (rev) {
      latestHighlightedRating = {
        id: pick.id,
        reviewer: toSocialAuthor(rev, socialScoreForUser(rev.id, domain)),
        value: pick.value,
        comment: pick.comment,
        createdAt: pick.createdAt,
      }
    }
  }

  return {
    average,
    distribution: dist,
    latestHighlightedRating,
  }
}

function statsForPost(
  postId: string,
  domain: FixtureDomain,
  snapshot?: FixturePostEngagementSnapshot,
): SocialPostStats {
  if (snapshot) return { ...snapshot.stats }
  const nComments = domain.comments.filter((c) => c.postId === postId).length
  const nRatings = domain.ratings.filter((r) => r.postId === postId).length
  return {
    ...emptyStats(),
    comments: nComments,
    ratingsCount: nRatings,
  }
}

function buildSocialPost(
  post: FixturePost,
  domain: FixtureDomain,
  userById: Map<string, FixtureUser>,
): SocialPost {
  const author = userById.get(post.authorId)
  if (!author) throw new Error(`[fixtures] Post ${post.id}: autor em falta`)

  const media = domain.postMedia
    .filter((m) => m.postId === post.id)
    .sort((a, b) => a.position - b.position)
    .map((m) => ({ id: m.id, type: m.type, url: m.url, alt: m.alt }))

  const snap = domain.postEngagementSnapshots?.[post.id]
  const content = mergedPostBody({
    content: post.content,
    title: post.title,
    description: post.description,
  })

  return {
    id: post.id,
    type: post.type,
    content,
    createdAt: post.createdAt,
    visibility: post.visibility,
    category: post.category,
    location: { ...post.location },
    author: toSocialAuthor(author, socialScoreForUser(author.id, domain)),
    media,
    stats: statsForPost(post.id, domain, snap),
    ratings: ratingsBlockForPost(post.id, domain, userById, snap),
    commentsPreview: commentsPreviewForPost(post.id, domain, userById),
    people: peopleForPost(post.id, domain, userById),
    tags: post.tags ? [...post.tags] : [],
    isTrending: Boolean(post.isTrending),
    isHighestRated: Boolean(post.isHighestRated),
  }
}

/** Avaliações listadas no separador «Avaliados» do perfil (não inclui todos os highlights de post). */
function profileRatedEntriesFromDomain(
  domain: FixtureDomain,
  sessionUserId: string,
  postsById: Map<string, FixturePost>,
): ProfileRatedEntry[] {
  return domain.ratings
    .filter((r) => r.revieweeId === sessionUserId && r.id.startsWith('rev_'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => {
      const stars = Math.min(5, Math.max(1, Math.round(r.value))) as ProfileRatedEntry['stars']
      const post = r.postId ? postsById.get(r.postId) : undefined
      const postTitle = post
        ? mergedPostBody({
            content: post.content,
            title: post.title,
            description: post.description,
          }).split('\n')[0]?.slice(0, 120) ?? null
        : null
      return {
        id: r.id,
        reviewerId: r.reviewerId,
        stars,
        comment: r.comment,
        postId: r.postId,
        postTitle,
        createdAt: r.createdAt,
      }
    })
}

function sessionFriendIds(domain: FixtureDomain, sessionUserId: string): string[] {
  const out = new Set<string>()
  for (const f of domain.friendships) {
    if (f.status !== 'accepted') continue
    if (f.userId === sessionUserId) out.add(f.friendUserId)
    else if (f.friendUserId === sessionUserId) out.add(f.userId)
  }
  return [...out]
}

function findSocialAuthorInLegacy(legacy: LegacyGwanSocialFixtureV1, id: string): SocialAuthor | undefined {
  for (const sp of legacy.socialPosts) {
    if (sp.author.id === id) return sp.author
    for (const c of sp.commentsPreview) {
      if (c.author.id === id) return c.author
    }
    const hi = sp.ratings.latestHighlightedRating
    if (hi?.reviewer.id === id) return hi.reviewer
  }
  return undefined
}

/** Converte fixture v1 (socialPosts denormalizados) para domínio normalizado + snapshots. */
export function legacyV1ToDomain(legacy: LegacyGwanSocialFixtureV1): FixtureDomain {
  const userMap = new Map<string, FixtureUser>()
  const socialScores = new Map<string, number>()

  function ingestAuthor(a: SocialAuthor) {
    if (!userMap.has(a.id)) {
      userMap.set(a.id, {
        id: a.id,
        username: a.username,
        displayName: a.name,
        avatarUrl: a.avatarUrl,
        headline: a.headline,
      })
      socialScores.set(a.id, a.score)
    }
  }

  const postEngagementSnapshots: Record<string, FixturePostEngagementSnapshot> = {}
  const comments: FixtureComment[] = []
  const postMentions: { postId: string; userId: string }[] = []
  const ratings: FixtureRating[] = []
  const posts: FixturePost[] = []
  const domainPostMedia: FixturePostMedia[] = []

  for (const sp of legacy.socialPosts) {
    ingestAuthor(sp.author)
    for (const c of sp.commentsPreview) ingestAuthor(c.author)
    const hi = sp.ratings.latestHighlightedRating
    if (hi) ingestAuthor(hi.reviewer)
    for (const p of sp.people) {
      if (!userMap.has(p.id)) {
        userMap.set(p.id, {
          id: p.id,
          username: p.id.replace('user_', 'user'),
          displayName: p.name,
          avatarUrl: '',
          headline: '',
        })
        socialScores.set(p.id, socialScores.get(p.id) ?? 4)
      }
    }

    const legacyBody = mergedPostBody(
      sp as SocialPost & { title?: string; description?: string },
    )
    posts.push({
      id: sp.id,
      authorId: sp.author.id,
      type: sp.type,
      content: legacyBody,
      createdAt: sp.createdAt,
      visibility: sp.visibility,
      category: sp.category,
      location: { ...sp.location },
      tags: [...sp.tags],
      isTrending: sp.isTrending,
      isHighestRated: sp.isHighestRated,
    })

    postEngagementSnapshots[sp.id] = {
      stats: { ...sp.stats },
      ratings: {
        average: sp.ratings.average,
        distribution: { ...sp.ratings.distribution },
        latestHighlightedRating: sp.ratings.latestHighlightedRating
          ? { ...sp.ratings.latestHighlightedRating }
          : null,
      },
    }

    sp.media.forEach((m, position) => {
      domainPostMedia.push({
        id: m.id,
        postId: sp.id,
        type: m.type,
        url: m.url,
        alt: m.alt,
        position,
      })
    })

    for (const c of sp.commentsPreview) {
      comments.push({
        id: c.id,
        postId: sp.id,
        authorId: c.author.id,
        text: c.text,
        createdAt: c.createdAt,
      })
    }

    for (const p of sp.people) {
      postMentions.push({ postId: sp.id, userId: p.id })
    }

    if (hi) {
      const rid = `int_${hi.id}`
      ratings.push({
        id: hi.id,
        reviewerId: hi.reviewer.id,
        revieweeId: sp.author.id,
        postId: sp.id,
        value: hi.value,
        comment: hi.comment,
        createdAt: hi.createdAt,
        contextType: 'social',
        interactionId: rid,
      })
    }
  }

  for (const entry of legacy.profile.ratedEntries) {
    const known = findSocialAuthorInLegacy(legacy, entry.reviewerId)
    if (known) ingestAuthor(known)
    else if (!userMap.has(entry.reviewerId)) {
      userMap.set(entry.reviewerId, {
        id: entry.reviewerId,
        username: entry.reviewerId.replace(/^user_/, 'u'),
        displayName: entry.reviewerId,
        avatarUrl: '',
        headline: 'Membro da comunidade',
      })
      socialScores.set(entry.reviewerId, 4)
    }
  }

  for (const entry of legacy.profile.ratedEntries) {
    ratings.push({
      id: entry.id,
      reviewerId: entry.reviewerId,
      revieweeId: legacy.sessionDefaultUserId,
      postId: entry.postId,
      value: entry.stars,
      comment: entry.comment,
      createdAt: entry.createdAt,
      contextType: 'social',
      interactionId: `int_${entry.id}`,
    })
  }

  for (const fid of legacy.profile.friendUserIds) {
    if (!userMap.has(fid)) {
      userMap.set(fid, {
        id: fid,
        username: fid.replace(/^user_/, ''),
        displayName: `Utilizador ${fid}`,
        avatarUrl: '',
        headline: '',
      })
      socialScores.set(fid, 4)
    }
  }

  const friendships = legacy.profile.friendUserIds.map((friendUserId) => ({
    userId: legacy.sessionDefaultUserId,
    friendUserId,
    status: 'accepted' as const,
  }))

  const interactions = ratings
    .filter((r) => r.interactionId)
    .map((r) => ({
      id: r.interactionId!,
      actorUserId: r.reviewerId,
      targetUserId: r.revieweeId,
      type: 'post_engagement',
      referenceType: r.postId ? 'post' : 'profile',
      referenceId: r.postId ?? r.revieweeId,
      occurredAt: r.createdAt,
      status: 'completed' as const,
    }))

  const userReputationContexts = [...socialScores.entries()].map(([userId, score]) => ({
    userId,
    contextType: 'social',
    score,
  }))

  return {
    users: [...userMap.values()],
    posts,
    postMedia: domainPostMedia,
    postMentions,
    comments,
    ratings,
    friendships,
    interactions,
    userReputationContexts,
    postEngagementSnapshots,
  }
}

export function hydrateFromDomain(
  domain: FixtureDomain,
  sessionDefaultUserId: string,
  sessionUserProfile: LegacyGwanSocialFixtureV1['sessionUserProfile'] | undefined,
  ui: LegacyGwanSocialFixtureV1['ui'],
): HydratedFixtures {
  const userById = buildUserMap(domain)
  const postsById = new Map(domain.posts.map((p) => [p.id, p]))
  const socialPosts = domain.posts.map((p) => buildSocialPost(p, domain, userById))
  const profileRatedEntries = profileRatedEntriesFromDomain(domain, sessionDefaultUserId, postsById)
  const sessionFriendUserIds = sessionFriendIds(domain, sessionDefaultUserId)

  return {
    domain,
    socialPosts,
    profileRatedEntries,
    sessionFriendUserIds,
    sessionDefaultUserId,
    sessionUserProfile,
    ui,
  }
}

export function hydrateRawFixture(raw: RawGwanFixture): HydratedFixtures {
  const domain: FixtureDomain =
    raw.schemaVersion >= 2
      ? (raw as GwanSocialFixtureV2Raw).domain
      : legacyV1ToDomain(raw as LegacyGwanSocialFixtureV1)

  return hydrateFromDomain(
    domain,
    raw.sessionDefaultUserId,
    raw.sessionUserProfile,
    raw.ui,
  )
}