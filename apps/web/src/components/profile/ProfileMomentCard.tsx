import { useNavigate } from 'react-router-dom'
import { ImageIcon, Sparkles, Trash2 } from 'lucide-react'
import { useSessionUser } from '@/contexts/SessionUserContext'
import type { Post } from '@/data/legacyFeed.types'
import { cn } from '@/lib/utils'

interface ProfileMomentCardProps {
  post: Post
  animationDelay?: number
  showDelete?: boolean
  onDeleteClick?: () => void
}

function ThumbnailBlock({
  urls,
  onOpen,
}: {
  urls: string[]
  onOpen: () => void
}) {
  if (urls.length === 0) {
    return (
      <div
        className="flex aspect-square w-full max-w-[9rem] shrink-0 items-center justify-center self-start rounded-2xl bg-stone-200/40 text-stone-400 ring-1 ring-stone-200/80 sm:max-w-[10.5rem]"
        aria-hidden
      >
        <ImageIcon className="h-9 w-9 opacity-60" strokeWidth={1.25} />
      </div>
    )
  }

  if (urls.length === 1) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="group relative aspect-square w-full max-w-[9rem] shrink-0 overflow-hidden rounded-2xl ring-1 ring-black/10 transition hover:ring-primary/30 sm:max-w-[10.5rem]"
      >
        <img
          src={urls[0]}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid w-full max-w-[9rem] shrink-0 grid-cols-2 gap-1 self-start rounded-2xl ring-1 ring-black/10 transition hover:ring-primary/30 sm:max-w-[10.5rem]"
    >
      {urls.slice(0, 4).map((url, i) => (
        <div key={`${url}-${i}`} className="relative aspect-square overflow-hidden rounded-lg bg-stone-100">
          <img src={url} alt="" className="h-full w-full object-cover" />
          {i === 3 && urls.length > 4 ? (
            <span className="absolute inset-0 flex items-center justify-center bg-neutral-900/55 text-sm font-semibold text-white backdrop-blur-[2px]">
              +{urls.length - 4}
            </span>
          ) : null}
        </div>
      ))}
    </button>
  )
}

export function ProfileMomentCard({
  post,
  animationDelay = 0,
  showDelete = false,
  onDeleteClick,
}: ProfileMomentCardProps) {
  const { resolveUser } = useSessionUser()
  const navigate = useNavigate()
  const author = resolveUser(post.userId)

  const imageUrls = post.image ? [post.image] : []

  const fullText = post.content
  const firstLine = (fullText.split('\n').find((l) => l.trim()) ?? fullText).trim()
  const headline =
    firstLine.length > 96 ? `${firstLine.slice(0, 93)}…` : firstLine
  const isFeatured = false

  const openPost = () => navigate(`/post/${post.id}`)

  if (!author) return null

  return (
    <article
      className={cn(
        'animate-fade-up flex flex-col gap-4 rounded-[22px] border border-stone-200/90 bg-gradient-to-b from-white to-stone-50/90 p-4 shadow-sm ring-1 ring-black/[0.04] sm:flex-row sm:items-stretch sm:gap-5 sm:p-5',
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <ThumbnailBlock urls={imageUrls} onOpen={openPost} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {isFeatured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" aria-hidden />
                Destaque
              </span>
            ) : null}
            <span className="text-xs text-neutral-500">{post.timestamp}</span>
          </div>
          {showDelete && onDeleteClick ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteClick()
              }}
              className="rounded-full p-2 text-neutral-400 transition hover:bg-destructive/10 hover:text-destructive"
              aria-label="Apagar publicação"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>

        <h3 className="mt-2 font-display text-lg font-medium leading-snug text-neutral-900">
          <button
            type="button"
            onClick={openPost}
            className="text-left transition hover:text-primary hover:underline decoration-primary/30 underline-offset-2"
          >
            {headline}
          </button>
        </h3>

        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
          {fullText}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-stone-200/80 pt-3 text-xs text-neutral-500">
          <span className="font-display tabular-nums text-neutral-800">
            ★ {post.rating.toFixed(1)}
          </span>
          <span className="tabular-nums">{post.likes.toLocaleString()} gostos</span>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={openPost}
            className="text-sm font-medium text-primary transition hover:text-primary/80 hover:underline"
          >
            Ver publicação completa
          </button>
        </div>
      </div>
    </article>
  )
}
