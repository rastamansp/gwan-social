import { useNavigate } from 'react-router-dom'
import { ImageIcon, MapPin, MessageCircle, Sparkles } from 'lucide-react'
import { useSessionUser } from '@/contexts/SessionUserContext'
import type { Post } from '@/data/mockUsers'
import { getSocialPostById } from '@/data/socialPosts.index'
import { cn } from '@/lib/utils'

interface ProfileMomentCardProps {
  post: Post
  animationDelay?: number
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

export function ProfileMomentCard({ post, animationDelay = 0 }: ProfileMomentCardProps) {
  const { resolveUser } = useSessionUser()
  const navigate = useNavigate()
  const social = getSocialPostById(post.id)
  const author = resolveUser(post.userId)

  const fromSocial = social?.media.filter((m) => m.type === 'image').map((m) => m.url) ?? []
  const imageUrls = fromSocial.length > 0 ? fromSocial : post.image ? [post.image] : []

  const title =
    social?.title ??
    (post.content.length > 96 ? `${post.content.slice(0, 93)}…` : post.content)

  const description = social?.description ?? post.content
  const isFeatured = social?.type === 'featured_moment'

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
        <div className="flex flex-wrap items-center gap-2">
          {isFeatured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" aria-hidden />
              Destaque
            </span>
          ) : null}
          <span className="text-xs text-neutral-500">{post.timestamp}</span>
        </div>

        <h3 className="mt-2 font-display text-lg font-medium leading-snug text-neutral-900">
          <button
            type="button"
            onClick={openPost}
            className="text-left transition hover:text-primary hover:underline decoration-primary/30 underline-offset-2"
          >
            {title}
          </button>
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-600">{description}</p>

        {social?.location?.name ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
            <span>
              {social.location.name}
              {social.location.city ? ` · ${social.location.city}` : ''}
            </span>
          </p>
        ) : null}

        {social?.tags && social.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {social.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 ring-1 ring-stone-200/80"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-stone-200/80 pt-3 text-xs text-neutral-500">
          <span className="font-display tabular-nums text-neutral-800">
            ★ {social ? social.ratings.average.toFixed(1) : post.rating.toFixed(1)}
            {social ? (
              <span className="ml-1 font-sans font-normal text-neutral-500">
                ({social.stats.ratingsCount} avaliações)
              </span>
            ) : null}
          </span>
          {social ? (
            <>
              <span className="tabular-nums">{social.stats.likes.toLocaleString()} gostos</span>
              <span className="flex items-center gap-1 tabular-nums">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                {social.stats.comments} comentários
              </span>
              <span className="tabular-nums">{social.stats.views.toLocaleString()} vistas</span>
            </>
          ) : (
            <span className="tabular-nums">{post.likes.toLocaleString()} gostos</span>
          )}
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
