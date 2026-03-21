/** Alinhado a `apps/api/src/application/shared/pagination.ts`. */
export interface PaginatedResult<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}
