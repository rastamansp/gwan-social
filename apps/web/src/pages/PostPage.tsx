import { useEffect, useMemo, useState } from 'react'
import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { SocialPostCard } from '@/components/social/SocialPostCard'
import { useSessionUser } from '@/contexts/SessionUserContext'
import { buildFallbackEditorial, getEditorialForPost, posts } from '@/data/mockUsers'
import { getRatingSpotlightPeople, getSocialPostById } from '@/data/socialPosts.index'
import { socialPostToEditorial, socialPostToLegacyPost } from '@/data/socialPosts.adapters'
import type { EditorialPost, Post } from '@/data/legacyFeed.types'
import type { RatingSpotlightPerson } from '@/data/socialPosts.index'
import type { SocialPost } from '@/data/socialPost.types'
import { isApiEnabled } from '@/lib/api/config'
import { ApiHttpError } from '@/lib/api/client'
import { fetchPostById } from '@/lib/api/endpoints'
import { cn } from '@/lib/utils'

export default function PostPage() {
  const { profile: sessionProfile, resolveUser } = useSessionUser()
  const { postId = '' } = useParams()
  const useApi = isApiEnabled()

  const mockPost = posts.find((p) => p.id === postId)
  const mockAuthor = mockPost ? resolveUser(mockPost.userId) : null

  const mockEditorial = useMemo(() => {
    if (!mockPost || !mockAuthor) return null
    return getEditorialForPost(mockPost.id) ?? buildFallbackEditorial(mockPost, mockAuthor, sessionProfile)
  }, [mockPost, mockAuthor, sessionProfile])

  const [apiSp, setApiSp] = useState<SocialPost | null>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

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

  const apiLegacyPost: Post | null = useMemo(
    () => (apiSp ? socialPostToLegacyPost(apiSp) : null),
    [apiSp],
  )
  const apiEditorial: EditorialPost | null = useMemo(
    () => (apiSp ? socialPostToEditorial(apiSp) : null),
    [apiSp],
  )

  const ratingSpotlights: RatingSpotlightPerson[] | undefined = useMemo(() => {
    const sp = useApi ? apiSp : getSocialPostById(postId)
    if (!sp) return undefined
    const list = getRatingSpotlightPeople(sp)
    return list.length > 1 ? list : undefined
  }, [useApi, apiSp, postId])

  const fromApi = Boolean(useApi && apiSp)
  const effectivePost: Post | null = fromApi ? apiLegacyPost : mockPost ?? null
  const effectiveEditorial: EditorialPost | null = fromApi ? apiEditorial : mockEditorial

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(effectivePost?.likes ?? 0)
  const [saved, setSaved] = useState(false)
  const [vote, setVote] = useState(0)
  const [voteFeedback, setVoteFeedback] = useState<string | null>(null)

  useEffect(() => {
    setLikeCount(effectivePost?.likes ?? 0)
    setLiked(false)
    setVote(0)
    setVoteFeedback(null)
  }, [effectivePost?.id, effectivePost?.likes])

  if (useApi && apiLoading && !apiSp && !mockPost) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-background px-4 py-12">
        <p className="font-display text-muted-foreground">A carregar postagem…</p>
      </div>
    )
  }

  if (useApi && !apiLoading && !apiSp && apiError === 'not_found' && !mockPost) {
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

  if (useApi && !apiLoading && !apiSp && apiError === 'network' && !mockPost) {
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

  if (!effectivePost || !effectiveEditorial) {
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

  const handleVote = (stars: number) => {
    setVote(stars)
    setVoteFeedback('Voto registado (demonstração). Obrigado.')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-6xl px-2 sm:px-4">
        <SocialPostCard
          post={effectiveEditorial}
          embedded
          cardFooterVote
          voteValue={vote}
          onVote={handleVote}
          voteFeedback={voteFeedback}
          ratingSpotlights={ratingSpotlights}
          ratingSpotlightIntervalMs={6200}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl border-t border-border/40 px-3 py-4 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-5">
            <button
              type="button"
              onClick={handleLike}
              className={cn(
                'flex min-h-11 items-center gap-1.5 text-sm transition-all duration-200 active:scale-95 sm:min-h-0',
                liked ? 'font-medium text-primary' : 'text-muted-foreground hover:text-primary',
              )}
            >
              <Heart size={18} className={cn(liked && 'fill-primary')} />
              <span className="tabular-nums">{likeCount}</span>
            </button>
            <span className="flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground sm:min-h-0">
              <MessageCircle size={18} />
              <span className="tabular-nums">{effectiveEditorial.comments.length}</span>
            </span>
            <button
              type="button"
              className="flex min-h-11 items-center text-muted-foreground transition-colors hover:text-foreground active:scale-95 sm:min-h-0"
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
              saved ? 'text-primary' : 'text-muted-foreground hover:text-primary',
            )}
            aria-label="Salvar"
          >
            <Bookmark size={18} className={cn(saved && 'fill-primary')} />
          </button>
        </div>
        <p className="mt-3 font-display text-sm text-muted-foreground">{effectivePost.timestamp}</p>
      </div>
    </div>
  )
}
