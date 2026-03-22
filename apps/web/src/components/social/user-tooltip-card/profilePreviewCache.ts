import type { UserProfile } from '@/data/legacyFeed.types'

/** Tempo que um perfil pré-carregado no hover é considerado válido sem novo GET. */
const PROFILE_PREVIEW_TTL_MS = 120_000

type CacheEntry = { profile: UserProfile; expiresAt: number }

const cache = new Map<string, CacheEntry>()
const inflight = new Map<string, Promise<UserProfile>>()

export function getProfilePreviewCached(userId: string): UserProfile | null {
  const e = cache.get(userId)
  if (!e) return null
  if (Date.now() > e.expiresAt) {
    cache.delete(userId)
    return null
  }
  return e.profile
}

export function setProfilePreviewCached(userId: string, profile: UserProfile) {
  cache.set(userId, {
    profile,
    expiresAt: Date.now() + PROFILE_PREVIEW_TTL_MS,
  })
}

/**
 * Evita vários `GET /users/:id` em paralelo (vários links do mesmo utilizador na página).
 * O pedido em curso é partilhado até resolver ou falhar.
 */
export function fetchProfilePreviewDeduped(
  userId: string,
  fetcher: () => Promise<UserProfile>,
): Promise<UserProfile> {
  const existing = inflight.get(userId)
  if (existing) return existing

  const p = fetcher().finally(() => {
    inflight.delete(userId)
  })
  inflight.set(userId, p)
  return p
}
