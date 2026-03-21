import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SocialPostCard } from '@/components/social/SocialPostCard'
import { useSessionUser } from '@/contexts/SessionUserContext'
import { buildFallbackEditorial, getEditorialForPost, posts } from '@/data/mockUsers'
import { socialPostToEditorial, socialPostToLegacyPost } from '@/data/socialPosts.adapters'
import type { EditorialPost, Post } from '@/data/legacyFeed.types'
import { isApiEnabled } from '@/lib/api/config'
import { ApiHttpError } from '@/lib/api/client'
import { fetchFeed } from '@/lib/api/endpoints'
import { cn } from '@/lib/utils'

type FeedItem = { post: Post; editorial: EditorialPost }

/** Listagem editorial (Nosedive) — mock local ou `GET /feed` quando `VITE_API_URL` está definida. */
export function FeedPostList() {
  const { profile: sessionProfile, resolveUser } = useSessionUser()
  const navigate = useNavigate()
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [voteFeedbackByPost, setVoteFeedbackByPost] = useState<Record<string, string | null>>({})

  const [apiItems, setApiItems] = useState<FeedItem[]>([])
  const [apiCursor, setApiCursor] = useState<string | null>(null)
  const [apiHasMore, setApiHasMore] = useState(false)
  const [apiLoading, setApiLoading] = useState(false)
  const [apiLoadingMore, setApiLoadingMore] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const useApi = isApiEnabled()

  const loadFeed = useCallback(async (cursor: string | null, append: boolean) => {
    if (!useApi) return
    if (append) setApiLoadingMore(true)
    else setApiLoading(true)
    setApiError(null)
    try {
      const page = await fetchFeed({ limit: 20, cursor: cursor ?? undefined })
      const chunk: FeedItem[] = page.items.map((sp) => ({
        post: socialPostToLegacyPost(sp),
        editorial: socialPostToEditorial(sp),
      }))
      setApiItems((prev) => (append ? [...prev, ...chunk] : chunk))
      setApiCursor(page.nextCursor)
      setApiHasMore(page.hasMore)
    } catch (e: unknown) {
      const msg =
        e instanceof ApiHttpError
          ? `Erro ${e.status} ao carregar o feed.`
          : 'Não foi possível ligar à API. Verifica VITE_API_URL e se o servidor está a correr.'
      setApiError(msg)
      if (!append) setApiItems([])
    } finally {
      setApiLoading(false)
      setApiLoadingMore(false)
    }
  }, [useApi])

  useEffect(() => {
    if (!useApi) return
    void loadFeed(null, false)
  }, [useApi, loadFeed])

  const mockItems = useMemo(() => {
    return posts
      .map((post) => {
        const author = resolveUser(post.userId)
        if (!author) return null
        const editorial =
          getEditorialForPost(post.id) ?? buildFallbackEditorial(post, author, sessionProfile)
        return { post, editorial }
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
  }, [resolveUser, sessionProfile])

  const items = useApi ? apiItems : mockItems

  const handleVote = (postId: string, stars: number) => {
    setVotes((v) => ({ ...v, [postId]: stars }))
    setVoteFeedbackByPost((f) => ({
      ...f,
      [postId]: 'Voto registado (demonstração). Obrigado.',
    }))
  }

  if (useApi && apiLoading && items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground">
        A carregar feed…
      </div>
    )
  }

  if (useApi && apiError && items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-12 text-center">
        <p className="text-sm text-destructive">{apiError}</p>
        <button
          type="button"
          className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
          onClick={() => void loadFeed(null, false)}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-2 py-4 sm:space-y-6 sm:px-4 sm:py-6 md:space-y-8">
      {useApi && apiError && items.length > 0 ? (
        <p className="rounded-xl bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 ring-1 ring-amber-200/80 dark:bg-amber-950/30 dark:text-amber-100">
          {apiError}
        </p>
      ) : null}
      {items.map(({ post, editorial }) => (
        <div
          key={post.id}
          role="link"
          tabIndex={0}
          className={cn(
            'block cursor-pointer rounded-2xl outline-none transition-opacity hover:opacity-[0.98] sm:rounded-3xl md:rounded-[32px]',
            'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
          )}
          onClick={() => navigate(`/post/${post.id}`)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              navigate(`/post/${post.id}`)
            }
          }}
        >
          <SocialPostCard
            post={editorial}
            embedded
            voteVariant="inline"
            voteValue={votes[post.id] ?? 0}
            onVote={(n) => handleVote(post.id, n)}
            voteFeedback={voteFeedbackByPost[post.id] ?? null}
          />
        </div>
      ))}
      {useApi && apiHasMore ? (
        <div className="flex justify-center pb-6">
          <button
            type="button"
            disabled={apiLoadingMore}
            className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            onClick={() => void loadFeed(apiCursor, true)}
          >
            {apiLoadingMore ? 'A carregar…' : 'Carregar mais'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
