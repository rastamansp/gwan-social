import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { MessageCircle } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { DeletePostConfirmModal } from '@/components/profile/DeletePostConfirmModal'
import { SocialPostCard } from '@/components/social/SocialPostCard'
import { useAuth } from '@/contexts/AuthContext'
import {
  ratingsCountLabelPt,
  socialPostToEditorial,
  socialPostToLegacyPost,
} from '@/data/socialPosts.adapters'
import type { EditorialPost, Post } from '@/data/legacyFeed.types'
import type { SocialPost } from '@/data/socialPost.types'
import { isApiEnabled } from '@/lib/api/config'
import { ApiHttpError } from '@/lib/api/client'
import {
  fetchCommentPost,
  fetchDeleteComment,
  fetchFeed,
  fetchMe,
  fetchRatePost,
} from '@/lib/api/endpoints'
import { loginPath } from '@/lib/routes'
import { cn } from '@/lib/utils'

type FeedItem = { post: Post; editorial: EditorialPost; social: SocialPost }

/** Listagem editorial — `GET /feed` (posts na base de dados) com `VITE_API_URL`; sem API, feed vazio (sem mock de fixtures). */
export function FeedPostList() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [voteFeedbackByPost, setVoteFeedbackByPost] = useState<Record<string, string | null>>({})
  const [voteSubmittingPostId, setVoteSubmittingPostId] = useState<string | null>(null)

  const [meId, setMeId] = useState<string | null>(null)
  const [commentDeleteTarget, setCommentDeleteTarget] = useState<{ postId: string; commentId: string } | null>(
    null,
  )
  const [commentDeletePending, setCommentDeletePending] = useState(false)
  const [commentDeleteError, setCommentDeleteError] = useState<string | null>(null)

  const commentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const [commentOpenPostId, setCommentOpenPostId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [commentSubmittingPostId, setCommentSubmittingPostId] = useState<string | null>(null)
  const [commentError, setCommentError] = useState<string | null>(null)

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
        social: sp,
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
    if (!useApi || !isAuthenticated) {
      setMeId(null)
      return
    }
    let cancelled = false
    fetchMe()
      .then((me) => {
        if (!cancelled) setMeId(me.id)
      })
      .catch(() => {
        if (!cancelled) setMeId(null)
      })
    return () => {
      cancelled = true
    }
  }, [useApi, isAuthenticated])

  useEffect(() => {
    if (!useApi) return
    void loadFeed(null, false)
  }, [useApi, loadFeed])

  const items = useApi ? apiItems : []

  const submitFeedRating = useCallback(
    async (postId: string, stars: number, authorUserId: string) => {
      if (stars < 1 || stars > 5) return
      if (!isAuthenticated) return
      if (meId && meId === authorUserId) return

      setVoteSubmittingPostId(postId)
      setVoteFeedbackByPost((f) => ({ ...f, [postId]: null }))
      try {
        const updated = await fetchRatePost(postId, stars)
        setVotes((v) => ({ ...v, [postId]: stars }))
        setVoteFeedbackByPost((f) => ({
          ...f,
          [postId]: 'Avaliação registada. Obrigado.',
        }))
        setApiItems((prev) =>
          prev.map((it) =>
            it.social.id === postId
              ? {
                  ...it,
                  social: updated,
                  post: socialPostToLegacyPost(updated),
                  editorial: socialPostToEditorial(updated),
                }
              : it,
          ),
        )
      } catch (e: unknown) {
        if (e instanceof ApiHttpError) {
          if (e.status === 401) {
            navigate(
              `${loginPath()}?from=${encodeURIComponent(location.pathname + location.search)}`,
            )
            return
          }
          setVoteFeedbackByPost((f) => ({ ...f, [postId]: e.message }))
        } else {
          setVoteFeedbackByPost((f) => ({
            ...f,
            [postId]: 'Não foi possível enviar a avaliação.',
          }))
        }
      } finally {
        setVoteSubmittingPostId(null)
      }
    },
    [isAuthenticated, meId, navigate, location.pathname, location.search],
  )

  const sidebarCommentsFor = useCallback((sp: SocialPost) => {
    return sp.commentsPreview.map((c) => ({
      id: c.id,
      authorUserId: c.author.id,
      author: c.author.name,
      text: c.text,
      createdAt: c.createdAt,
    }))
  }, [])

  const confirmDeleteFeedComment = useCallback(async () => {
    if (!commentDeleteTarget) return
    const { postId, commentId } = commentDeleteTarget
    setCommentDeletePending(true)
    setCommentDeleteError(null)
    try {
      const updated = await fetchDeleteComment(postId, commentId)
      setApiItems((prev) =>
        prev.map((it) =>
          it.social.id === postId
            ? {
                ...it,
                social: updated,
                post: socialPostToLegacyPost(updated),
                editorial: socialPostToEditorial(updated),
              }
            : it,
        ),
      )
      setCommentDeleteTarget(null)
    } catch (e: unknown) {
      setCommentDeleteError(
        e instanceof ApiHttpError ? e.message : 'Não foi possível apagar o comentário.',
      )
    } finally {
      setCommentDeletePending(false)
    }
  }, [commentDeleteTarget])

  useEffect(() => {
    setCommentText('')
    setCommentError(null)
  }, [commentOpenPostId])

  useEffect(() => {
    if (commentOpenPostId && isAuthenticated) {
      commentTextareaRef.current?.focus()
    }
  }, [commentOpenPostId, isAuthenticated])

  const submitFeedComment = useCallback(async () => {
    const pid = commentOpenPostId
    if (!pid) return
    const trimmed = commentText.trim()
    if (!trimmed) {
      setCommentError('Escreve uma mensagem antes de enviar.')
      return
    }
    setCommentSubmittingPostId(pid)
    setCommentError(null)
    try {
      const updated = await fetchCommentPost(pid, trimmed)
      setApiItems((prev) =>
        prev.map((it) =>
          it.social.id === pid
            ? {
                ...it,
                social: updated,
                post: socialPostToLegacyPost(updated),
                editorial: socialPostToEditorial(updated),
              }
            : it,
        ),
      )
      setCommentText('')
    } catch (e: unknown) {
      setCommentError(
        e instanceof ApiHttpError ? e.message : 'Não foi possível enviar o comentário.',
      )
    } finally {
      setCommentSubmittingPostId(null)
    }
  }, [commentOpenPostId, commentText])

  const openFeedCommentComposer = useCallback(
    (postId: string) => {
      if (!isAuthenticated) {
        navigate(`${loginPath()}?from=${encodeURIComponent(location.pathname + location.search)}`)
        return
      }
      setCommentOpenPostId(postId)
    },
    [isAuthenticated, navigate, location.pathname, location.search],
  )

  const onFeedCommentKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        void submitFeedComment()
      }
    },
    [submitFeedComment],
  )

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

  if (!useApi) {
    return (
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-12 text-center text-sm text-muted-foreground">
        <p>O feed usa apenas posts criados na API (PostgreSQL).</p>
        <p>
          Define <code className="rounded bg-muted px-1.5 py-0.5 text-xs">VITE_API_URL</code> no{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">apps/web/.env</code> (ex.:{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            http://localhost:4000/api/v1
          </code>
          ) e reinicia o Vite para ver o feed.
        </p>
      </div>
    )
  }

  if (useApi && !apiLoading && items.length === 0 && !apiError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center text-sm text-muted-foreground">
        <p>Ainda não há posts na base de dados.</p>
        <p className="mt-2">Cria uma publicação em Nova postagem para testar o feed.</p>
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
      {items.map(({ post, editorial, social }) => {
        const commentOpen = commentOpenPostId === social.id
        const commentSubmitting = commentSubmittingPostId === social.id
        const commentComposerBelowTitle =
          commentOpen && isAuthenticated ? (
            <div className="space-y-3 rounded-2xl border border-white/25 bg-white/10 p-3 ring-1 ring-white/10 sm:p-4">
              <label htmlFor={`feed-post-comment-${social.id}`} className="sr-only">
                Escrever comentário
              </label>
              <textarea
                ref={commentOpen ? commentTextareaRef : undefined}
                id={`feed-post-comment-${social.id}`}
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={onFeedCommentKeyDown}
                placeholder="Escreve um comentário… (Enter para enviar, Shift+Enter para nova linha)"
                disabled={commentSubmitting}
                className="w-full resize-y rounded-xl border border-white/20 bg-white/15 px-3 py-2.5 text-sm text-nosedive-title placeholder:text-nosedive-muted/70 outline-none ring-nosedive-star/30 focus:border-nosedive-star/40 focus:ring-2 disabled:opacity-60"
              />
              {commentError ? (
                <p className="text-sm text-red-300" role="alert">
                  {commentError}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void submitFeedComment()}
                  disabled={commentSubmitting}
                  className="rounded-full border border-white/35 bg-white/20 px-4 py-2 text-sm font-medium text-nosedive-title transition hover:bg-white/30 disabled:opacity-50"
                >
                  {commentSubmitting ? 'A enviar…' : 'Enviar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCommentOpenPostId(null)
                    setCommentError(null)
                  }}
                  disabled={commentSubmitting}
                  className="text-sm text-nosedive-muted underline-offset-2 hover:underline"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : null

        return (
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
              voteValue={votes[post.id] ?? 0}
              onVote={(n) => void submitFeedRating(social.id, n, social.author.id)}
              voteFeedback={voteFeedbackByPost[post.id] ?? null}
              voteSubmitting={voteSubmittingPostId === social.id}
              voteSubmitDisabled={
                !isAuthenticated ||
                (Boolean(meId) && meId === social.author.id) ||
                voteSubmittingPostId === social.id
              }
              voteHint={
                !isAuthenticated
                  ? 'Inicia sessão para avaliar.'
                  : meId && meId === social.author.id
                    ? 'Não podes avaliar o teu próprio post.'
                    : null
              }
              ratedCountLabel={ratingsCountLabelPt(social.stats.ratingsCount)}
              sidebarComments={sidebarCommentsFor(social)}
              sidebarCommentsBelowTitleSlot={commentComposerBelowTitle}
              sidebarCommentsTitleTrailing={
                <button
                  type="button"
                  onClick={() => openFeedCommentComposer(social.id)}
                  className={cn(
                    'inline-flex size-9 items-center justify-center rounded-full border border-white/35 bg-white/15 transition sm:size-10',
                    commentOpen
                      ? 'text-nosedive-star ring-1 ring-nosedive-star/35'
                      : 'text-nosedive-title hover:bg-white/25',
                  )}
                  aria-expanded={commentOpen}
                  aria-label="Comentar"
                >
                  <MessageCircle size={18} strokeWidth={1.75} className="shrink-0 opacity-90" />
                </button>
              }
              sidebarCommentsEmptySlot={
                commentOpen && isAuthenticated ? undefined : (
                  <>
                    Ainda não há comentários.{' '}
                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => openFeedCommentComposer(social.id)}
                        className="font-medium text-nosedive-star underline-offset-2 hover:underline"
                      >
                        Sê o primeiro a comentar
                      </button>
                    ) : (
                      <Link
                        to={`${loginPath()}?from=${encodeURIComponent(location.pathname + location.search)}`}
                        className="font-medium text-nosedive-star underline-offset-2 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Inicia sessão para comentar
                      </Link>
                    )}
                  </>
                )
              }
              commentCurrentUserId={meId}
              postAuthorUserId={social.author.id}
              onRequestDeleteComment={(commentId) =>
                setCommentDeleteTarget({ postId: social.id, commentId })
              }
            />
          </div>
        )
      })}
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

      <DeletePostConfirmModal
        open={commentDeleteTarget !== null}
        title="Apagar comentário"
        description="Tens a certeza? Esta ação não pode ser desfeita."
        errorText={commentDeleteError}
        confirmLabel="Apagar"
        pending={commentDeletePending}
        onConfirm={() => void confirmDeleteFeedComment()}
        onCancel={() => {
          if (!commentDeletePending) {
            setCommentDeleteTarget(null)
            setCommentDeleteError(null)
          }
        }}
      />
    </div>
  )
}
