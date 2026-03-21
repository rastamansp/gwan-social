import { useMemo, useState } from 'react'
import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { SocialPostCard } from '@/components/social/SocialPostCard'
import { useSessionUser } from '@/contexts/SessionUserContext'
import { buildFallbackEditorial, getEditorialForPost, posts } from '@/data/mockUsers'
import { cn } from '@/lib/utils'

export default function PostPage() {
  const { profile: sessionProfile, resolveUser } = useSessionUser()
  const { postId = '' } = useParams()
  const post = posts.find((p) => p.id === postId)
  const author = post ? resolveUser(post.userId) : null

  const editorial = useMemo(() => {
    if (!post || !author) return null
    return getEditorialForPost(post.id) ?? buildFallbackEditorial(post, author, sessionProfile)
  }, [post, author, sessionProfile])

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post?.likes ?? 0)
  const [saved, setSaved] = useState(false)
  /** Votação 1–5 (mock local; sem API). */
  const [vote, setVote] = useState(0)
  const [voteFeedback, setVoteFeedback] = useState<string | null>(null)

  if (!post || !author || !editorial) {
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
          post={editorial}
          embedded
          cardFooterVote
          voteValue={vote}
          onVote={handleVote}
          voteFeedback={voteFeedback}
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
              <span className="tabular-nums">{editorial.comments.length}</span>
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
        <p className="mt-3 font-display text-sm text-muted-foreground">{post.timestamp}</p>
      </div>
    </div>
  )
}
