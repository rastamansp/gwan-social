import { useState, type MouseEvent } from 'react'
import { Heart, MessageCircle, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UserProfileHoverLink } from '@/components/social/user-tooltip-card'
import { useSessionUser } from '@/contexts/SessionUserContext'
import type { Post } from '@/data/legacyFeed.types'
import { StarRating } from '@/components/social/StarRating'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: Post
  animationDelay?: number
  className?: string
}

export function PostCard({ post, animationDelay = 0, className }: PostCardProps) {
  const { resolveUser } = useSessionUser()
  const author = resolveUser(post.userId)!
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount((c) => (liked ? c - 1 : c + 1))
  }

  return (
    <article
      className={cn(
        'animate-fade-up rounded-2xl border border-border/50 bg-card p-5 shadow-sm',
        className,
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <UserProfileHoverLink
        userId={author.id}
        cachedProfile={author}
        wrapperClassName="mb-3 block w-full"
        className="flex w-full items-center gap-3 rounded-xl outline-none ring-primary/30 transition-colors hover:bg-muted/40 focus-visible:ring-2"
        onClick={(e: MouseEvent) => e.stopPropagation()}
      >
        <img
          src={author.avatar}
          alt=""
          className="h-11 w-11 rounded-xl object-cover shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-semibold">{author.name}</span>
            <span className="flex items-center gap-0.5 font-display text-xs tabular-nums text-muted-foreground">
              <Star size={10} className="fill-rating-gold text-rating-gold" />
              {author.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{post.timestamp}</span>
        </div>
      </UserProfileHoverLink>

      <p
        className="mb-4 cursor-pointer leading-relaxed text-foreground transition-colors hover:text-primary/80"
        onClick={() => navigate(`/post/${post.id}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            navigate(`/post/${post.id}`)
          }
        }}
        role="button"
        tabIndex={0}
      >
        {post.content}
      </p>

      <div className="flex items-center justify-between border-t border-border/40 pt-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1.5 text-sm transition-all duration-200 active:scale-95',
              liked ? 'font-medium text-primary' : 'text-muted-foreground hover:text-primary',
            )}
          >
            <Heart size={16} className={cn(liked && 'fill-primary')} />
            <span className="tabular-nums">{likeCount}</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground active:scale-95"
          >
            <MessageCircle size={16} />
            <span>Comentar</span>
          </button>
        </div>
        <StarRating rating={0} size="sm" interactive onRate={() => {}} />
      </div>
    </article>
  )
}
