import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ApiRequiredMessage } from '@/components/common/ApiRequiredMessage'
import { DeletePostConfirmModal } from '@/components/profile/DeletePostConfirmModal'
import { SocialPostCard } from '@/components/social/SocialPostCard'
import { useAuth } from '@/contexts/AuthContext'
import { getRatingSpotlightPeople } from '@/data/socialPosts.index'
import type { RatingSpotlightPerson } from '@/data/socialPosts.index'
import { ratingsCountLabelPt, socialPostToEditorial, socialPostToLegacyPost } from '@/data/socialPosts.adapters'
import type { EditorialPost, Post } from '@/data/legacyFeed.types'
import type { SocialPost } from '@/data/socialPost.types'
import { isApiEnabled } from '@/lib/api/config'
import { ApiHttpError } from '@/lib/api/client'
import { fetchCommentPost, fetchDeleteComment, fetchMe, fetchPostById, fetchRatePost } from '@/lib/api/endpoints'
import { loginPath } from '@/lib/routes'
import { cn } from '@/lib/utils'

export default function PostPage() {
  const { postId = '' } = useParams()
  const useApi = isApiEnabled()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null)

  const [apiSp, setApiSp] = useState<SocialPost | null>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const [commentOpen, setCommentOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)

  useEffect(() => {
    if (!useApi || !postId) {
      setApiSp(null)
      setApiError(null)
      return
    }
    let cancelled = false
    setApiLoading(true)
    setApiError(null)
    fetchPostById(postId)
      .then((sp) => {
        if (!cancelled) setApiSp(sp)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setApiSp(null)
        if (e instanceof ApiHttpError && e.status === 404) {
          setApiError('not_found')
        } else {
          setApiError('network')
        }
      })
      .finally(() => {
        if (!cancelled) setApiLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [useApi, postId])

  useEffect(() => {
    setCommentOpen(false)
    setCommentText('')
    setCommentError(null)
    setCommentDeleteTargetId(null)
    setCommentDeleteError(null)
  }, [postId])

  useEffect(() => {
    if (commentOpen && isAuthenticated) {
      commentTextareaRef.current?.focus()
    }
  }, [commentOpen, isAuthenticated])

  const apiLegacyPost: Post | null = useMemo(
    () => (apiSp ? socialPostToLegacyPost(apiSp) : null),
    [apiSp],
  )
  const apiEditorial: EditorialPost | null = useMemo(
    () => (apiSp ? socialPostToEditorial(apiSp) : null),
    [apiSp],
  )

  const ratingSpotlights: RatingSpotlightPerson[] | undefined = useMemo(() => {
    if (!apiSp) return undefined
    const list = getRatingSpotlightPeople(apiSp)
    return list.length > 1 ? list : undefined
  }, [apiSp])

  const postDetailSidebarComments = useMemo(() => {
    if (!apiSp) return []
    return apiSp.commentsPreview.map((c) => ({
      id: c.id,
      authorUserId: c.author.id,
      author: c.author.name,
      text: c.text,
      createdAt: c.createdAt,
    }))
  }, [apiSp])

  const [commentDeleteTargetId, setCommentDeleteTargetId] = useState<string | null>(null)
  const [commentDeletePending, setCommentDeletePending] = useState(false)
  const [commentDeleteError, setCommentDeleteError] = useState<string | null>(null)

  const confirmDeleteComment = useCallback(async () => {
    if (!postId || !commentDeleteTargetId) return
    setCommentDeletePending(true)
    setCommentDeleteError(null)
    try {
      const updated = await fetchDeleteComment(postId, commentDeleteTargetId)
      setApiSp(updated)
      setCommentDeleteTargetId(null)
    } catch (e: unknown) {
      setCommentDeleteError(
        e instanceof ApiHttpError ? e.message : 'Não foi possível apagar o comentário.',
      )
    } finally {
      setCommentDeletePending(false)
    }
  }, [postId, commentDeleteTargetId])

  const [meId, setMeId] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(apiLegacyPost?.likes ?? 0)
  const [saved, setSaved] = useState(false)
  const [pendingRating, setPendingRating] = useState(0)
  const [voteFeedback, setVoteFeedback] = useState<string | null>(null)
  const [ratingSubmitting, setRatingSubmitting] = useState(false)

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
    setLikeCount(apiLegacyPost?.likes ?? 0)
    setLiked(false)
    setPendingRating(0)
    setVoteFeedback(null)
  }, [apiLegacyPost?.id, apiLegacyPost?.likes])

  const isOwnPost = Boolean(apiSp && meId && meId === apiSp.author.id)

  const voteHint = !isAuthenticated
    ? 'Inicia sessão para avaliar.'
    : isOwnPost
      ? 'Não podes avaliar o teu próprio post.'
      : null

  const submitRating = useCallback(async () => {
    if (!postId || !apiSp || !isAuthenticated || isOwnPost) return
    const v = pendingRating
    if (v < 1 || v > 5) {
      setVoteFeedback('Escolhe de 1 a 5 estrelas antes de enviar.')
      return
    }
    setRatingSubmitting(true)
    setVoteFeedback(null)
    try {
      const updated = await fetchRatePost(postId, v)
      setApiSp(updated)
      setVoteFeedback('Avaliação registada. Obrigado.')
    } catch (e: unknown) {
      if (e instanceof ApiHttpError) {
        if (e.status === 401) {
          navigate(`${loginPath()}?from=${encodeURIComponent(location.pathname + location.search)}`)
          return
        }
        setVoteFeedback(e.message)
      } else {
        setVoteFeedback('Não foi possível enviar a avaliação.')
      }
    } finally {
      setRatingSubmitting(false)
    }
  }, [
    postId,
    apiSp,
    isAuthenticated,
    isOwnPost,
    pendingRating,
    navigate,
    location.pathname,
    location.search,
  ])

  const submitComment = useCallback(async () => {
    if (!postId || !apiSp) return
    const trimmed = commentText.trim()
    if (!trimmed) {
      setCommentError('Escreve uma mensagem antes de enviar.')
      return
    }
    setCommentSubmitting(true)
    setCommentError(null)
    try {
      const updated = await fetchCommentPost(postId, trimmed)
      setApiSp(updated)
      setCommentText('')
    } catch (e: unknown) {
      setCommentError(
        e instanceof ApiHttpError ? e.message : 'Não foi possível enviar o comentário.',
      )
    } finally {
      setCommentSubmitting(false)
    }
  }, [postId, apiSp, commentText])

  const openCommentComposer = useCallback(() => {
    if (!isAuthenticated) {
      navigate(`${loginPath()}?from=${encodeURIComponent(location.pathname + location.search)}`)
      return
    }
    setCommentOpen(true)
  }, [isAuthenticated, navigate, location.pathname, location.search])

  const onCommentKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        void submitComment()
      }
    },
    [submitComment],
  )

  if (!useApi) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <ApiRequiredMessage title="Post" />
      </div>
    )
  }

  if (apiLoading && !apiSp) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-background px-4 py-12">
        <p className="font-display text-muted-foreground">A carregar postagem…</p>
      </div>
    )
  }

  if (!apiLoading && !apiSp && apiError === 'not_found') {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-background px-4 py-12">
        <div className="space-y-3 text-center">
          <p className="font-display text-muted-foreground">Postagem não encontrada</p>
          <Link
            to="/"
            className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Voltar ao feed
          </Link>
        </div>
      </div>
    )
  }

  if (!apiLoading && !apiSp && apiError === 'network') {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-background px-4 py-12">
        <div className="space-y-3 text-center">
          <p className="text-sm text-destructive">Não foi possível carregar o post pela API.</p>
          <Link
            to="/"
            className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Voltar ao feed
          </Link>
        </div>
      </div>
    )
  }

  if (!apiLegacyPost || !apiEditorial || !apiSp) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-background px-4 py-12">
        <div className="space-y-3 text-center">
          <p className="font-display text-muted-foreground">Postagem não encontrada</p>
          <Link
            to="/"
            className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Voltar ao feed
          </Link>
        </div>
      </div>
    )
  }

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount((c) => (liked ? c - 1 : c + 1))
  }

  const commentCount = apiSp.stats.comments

  const commentComposerBelowTitle =
    commentOpen && isAuthenticated ? (
      <div className="space-y-3 rounded-2xl border border-white/25 bg-white/10 p-3 ring-1 ring-white/10 sm:p-4">
        <label htmlFor="post-comment" className="sr-only">
          Escrever comentário
        </label>
        <textarea
          ref={commentTextareaRef}
          id="post-comment"
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={onCommentKeyDown}
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
            onClick={() => void submitComment()}
            disabled={commentSubmitting}
            className="rounded-full border border-white/35 bg-white/20 px-4 py-2 text-sm font-medium text-nosedive-title transition hover:bg-white/30 disabled:opacity-50"
          >
            {commentSubmitting ? 'A enviar…' : 'Enviar'}
          </button>
          <button
            type="button"
            onClick={() => {
              setCommentOpen(false)
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

  const embeddedDetailSlot = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <button
            type="button"
            onClick={handleLike}
            className={cn(
              'flex min-h-11 items-center gap-1.5 text-sm transition-all duration-200 active:scale-95 sm:min-h-0',
              liked
                ? 'font-medium text-nosedive-star'
                : 'text-nosedive-muted hover:text-nosedive-title',
            )}
          >
            <Heart size={18} className={cn(liked && 'fill-current')} />
            <span className="tabular-nums">{likeCount}</span>
          </button>
          <button
            type="button"
            onClick={openCommentComposer}
            className={cn(
              'flex min-h-11 items-center gap-1.5 text-sm transition-colors active:scale-95 sm:min-h-0',
              commentOpen ? 'font-medium text-nosedive-star' : 'text-nosedive-muted hover:text-nosedive-title',
            )}
            aria-expanded={commentOpen}
            aria-label="Comentários"
          >
            <MessageCircle size={18} />
            <span className="tabular-nums">{commentCount}</span>
          </button>
          <button
            type="button"
            className="flex min-h-11 items-center text-nosedive-muted transition-colors hover:text-nosedive-title active:scale-95 sm:min-h-0"
            aria-label="Compartilhar"
          >
            <Share2 size={18} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setSaved(!saved)}
          className={cn(
            'flex min-h-11 min-w-11 items-center justify-center transition-all active:scale-95 sm:min-h-0 sm:min-w-0',
            saved ? 'text-nosedive-star' : 'text-nosedive-muted hover:text-nosedive-title',
          )}
          aria-label="Salvar"
        >
          <Bookmark size={18} className={cn(saved && 'fill-current')} />
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-6xl px-2 sm:px-4">
        <SocialPostCard
          post={apiEditorial}
          embedded
          voteValue={pendingRating}
          onVote={setPendingRating}
          onVoteSubmit={() => void submitRating()}
          voteSubmitting={ratingSubmitting}
          voteSubmitDisabled={!isAuthenticated || isOwnPost}
          voteHint={voteHint}
          voteFeedback={voteFeedback}
          ratedCountLabel={ratingsCountLabelPt(apiSp.stats.ratingsCount)}
          sidebarComments={postDetailSidebarComments}
          sidebarCommentsBelowTitleSlot={commentComposerBelowTitle}
          sidebarCommentsTitleTrailing={
            <button
              type="button"
              onClick={openCommentComposer}
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
                    onClick={openCommentComposer}
                    className="font-medium text-nosedive-star underline-offset-2 hover:underline"
                  >
                    Sê o primeiro a comentar
                  </button>
                ) : (
                  <Link
                    to={`${loginPath()}?from=${encodeURIComponent(location.pathname + location.search)}`}
                    className="font-medium text-nosedive-star underline-offset-2 hover:underline"
                  >
                    Inicia sessão para comentar
                  </Link>
                )}
              </>
            )
          }
          ratingSpotlights={ratingSpotlights}
          ratingSpotlightIntervalMs={6200}
          embeddedDetailSlot={embeddedDetailSlot}
          commentCurrentUserId={meId}
          postAuthorUserId={apiSp?.author.id ?? null}
          onRequestDeleteComment={(cid) => setCommentDeleteTargetId(cid)}
        />
      </div>

      <DeletePostConfirmModal
        open={commentDeleteTargetId !== null}
        title="Apagar comentário"
        description="Tens a certeza? Esta ação não pode ser desfeita."
        errorText={commentDeleteError}
        confirmLabel="Apagar"
        pending={commentDeletePending}
        onConfirm={() => void confirmDeleteComment()}
        onCancel={() => {
          if (!commentDeletePending) {
            setCommentDeleteTargetId(null)
            setCommentDeleteError(null)
          }
        }}
      />
    </div>
  )
}
