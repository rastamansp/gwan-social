export interface PaginatedResult<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

export function parseIndexCursor(cursor: string | undefined): number {
  if (!cursor) return 0
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf8')
    const o = JSON.parse(json) as { i?: unknown }
    const i = o.i
    if (typeof i === 'number' && i >= 0 && Number.isInteger(i)) return i
  } catch {
    /* ignore */
  }
  return 0
}

export function encodeIndexCursor(index: number): string {
  return Buffer.from(JSON.stringify({ i: index }), 'utf8').toString('base64url')
}

export function clampLimit(raw: string | undefined, fallback = 20, max = 50): number {
  const n = Number.parseInt(raw ?? '', 10)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(n, max)
}

export function paginateByIndex<T>(all: T[], cursor: string | undefined, limit: number): PaginatedResult<T> {
  const start = parseIndexCursor(cursor)
  const items = all.slice(start, start + limit)
  const nextIndex = start + items.length
  const hasMore = nextIndex < all.length
  return {
    items,
    nextCursor: hasMore ? encodeIndexCursor(nextIndex) : null,
    hasMore,
  }
}
