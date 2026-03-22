import { useEffect, useState } from 'react'
import { socialAuthorToUserProfile } from '@/data/socialPosts.adapters'
import type { UserProfile } from '@/data/legacyFeed.types'
import type { SocialAuthor } from '@/data/socialPost.types'
import { ApiHttpError } from '@/lib/api/client'
import { isApiEnabled } from '@/lib/api/config'
import { fetchFeed } from '@/lib/api/endpoints'

export type AuthorProfilesFeedStatus = 'idle' | 'loading' | 'ok' | 'err'

/**
 * Perfis únicos derivados dos autores do feed (sem endpoint de diretório).
 */
export function useAuthorProfilesFromFeed(limit = 40): {
  profiles: UserProfile[]
  status: AuthorProfilesFeedStatus
  useApi: boolean
  errorMessage: string | null
} {
  const useApi = isApiEnabled()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [status, setStatus] = useState<AuthorProfilesFeedStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!useApi) {
      setProfiles([])
      setStatus('idle')
      setErrorMessage(null)
      return
    }
    let cancelled = false
    setStatus('loading')
    setErrorMessage(null)
    fetchFeed({ limit })
      .then((page) => {
        if (cancelled) return
        const byId = new Map<string, SocialAuthor>()
        for (const sp of page.items) {
          if (!byId.has(sp.author.id)) byId.set(sp.author.id, sp.author)
        }
        setProfiles([...byId.values()].map(socialAuthorToUserProfile))
        setStatus('ok')
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setProfiles([])
        setStatus('err')
        setErrorMessage(
          e instanceof ApiHttpError
            ? `Erro ${e.status} ao carregar o feed.`
            : 'Não foi possível ligar à API.',
        )
      })
    return () => {
      cancelled = true
    }
  }, [useApi, limit])

  return { profiles, status, useApi, errorMessage }
}
