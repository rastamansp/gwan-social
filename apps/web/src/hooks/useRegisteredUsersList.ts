import { useCallback, useEffect, useState } from 'react'
import type { UserProfile } from '@/data/legacyFeed.types'
import { ApiHttpError } from '@/lib/api/client'
import { isApiEnabled } from '@/lib/api/config'
import { fetchUsersList } from '@/lib/api/endpoints'
import { mapApiPublicUserToProfile } from '@/lib/api/mapApiUserToProfile'

export type RegisteredUsersStatus = 'idle' | 'loading' | 'ok' | 'err'

const PAGE_LIMIT = 50

/**
 * Diretório de utilizadores registados (`GET /users`), com paginação.
 * @param enabled — só dispara o primeiro pedido quando true (ex.: `tab === 'pessoas'`).
 */
export function useRegisteredUsersList(enabled: boolean): {
  profiles: UserProfile[]
  status: RegisteredUsersStatus
  useApi: boolean
  errorMessage: string | null
  hasMore: boolean
  loadingMore: boolean
  loadMore: () => void
} {
  const useApi = isApiEnabled()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [status, setStatus] = useState<RegisteredUsersStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadPage = useCallback(async (append: boolean, cursorVal: string | null) => {
    if (!useApi) return
    if (append) setLoadingMore(true)
    else {
      setStatus('loading')
      setErrorMessage(null)
    }
    try {
      const page = await fetchUsersList({
        limit: PAGE_LIMIT,
        cursor: cursorVal ?? undefined,
      })
      const mapped = page.items.map(mapApiPublicUserToProfile)
      setProfiles((prev) => (append ? [...prev, ...mapped] : mapped))
      setCursor(page.nextCursor)
      setHasMore(page.hasMore)
      setStatus('ok')
    } catch (e: unknown) {
      if (!append) {
        setProfiles([])
        setStatus('err')
        setErrorMessage(
          e instanceof ApiHttpError
            ? `Erro ${e.status} ao carregar utilizadores.`
            : 'Não foi possível ligar à API.',
        )
      }
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }, [useApi])

  useEffect(() => {
    if (!useApi) {
      setProfiles([])
      setStatus('idle')
      setErrorMessage(null)
      setCursor(null)
      setHasMore(false)
      return
    }
    if (!enabled) return
    void loadPage(false, null)
  }, [enabled, useApi, loadPage])

  const loadMore = useCallback(() => {
    if (!useApi || !hasMore || !cursor || loadingMore || status !== 'ok') return
    void loadPage(true, cursor)
  }, [useApi, hasMore, cursor, loadingMore, status, loadPage])

  return {
    profiles,
    status,
    useApi,
    errorMessage,
    hasMore,
    loadingMore,
    loadMore,
  }
}
