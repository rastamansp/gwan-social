import { Link } from 'react-router-dom'
import type { EditorialPost } from '@/data/mockUsers'
import type { RatingSpotlightPerson } from '@/data/socialPosts.index'
import { posts } from '@/data/mockUsers'
import { UserReputationSidebar } from '@/components/social/UserReputationSidebar'
import { VoteStarRow } from '@/components/social/VoteStarRow'
import { cn } from '@/lib/utils'

interface SocialPostCardProps {
  post: EditorialPost
  className?: string
  /** Quando true, não centraliza verticalmente (uso abaixo de header de detalhe). */
  embedded?: boolean
  /** Votação mock (1–5); com onVote ativa VoteStarRow na sidebar ou inline. */
  voteValue?: number
  onVote?: (stars: number) => void
  voteFeedback?: string | null
  ratedCountLabel?: string
  /** `sidebar` (detalhe do post) ou `inline` (feed: estrelas no canto inferior direito da coluna principal). */
  voteVariant?: 'sidebar' | 'inline'
  /** Rodapé do cartão editorial, à direita (ex.: página `/post/:id`). */
  cardFooterVote?: boolean
  /** Sequência para alternar o bloco “quem avaliou” com esmaecer (ex.: detalhe do post). */
  ratingSpotlights?: RatingSpotlightPerson[]
  /** Intervalo entre troca de spotlights (ms). */
  ratingSpotlightIntervalMs?: number
}

/** Card editorial estilo Nosedive: galeria + sidebar. Apenas apresentação. */
export function SocialPostCard({
  post,
  className,
  embedded,
  voteValue,
  onVote,
  voteFeedback,
  ratedCountLabel,
  voteVariant = 'sidebar',
  cardFooterVote = false,
  ratingSpotlights,
  ratingSpotlightIntervalMs,
}: SocialPostCardProps) {
  const authorUserId = posts.find((p) => p.id === post.id)?.userId
  const profileHref = authorUserId ? `/user/${authorUserId}` : null

  const sidebarOnVote = voteVariant === 'sidebar' ? onVote : undefined
  const sidebarVoteValue = voteVariant === 'sidebar' ? voteValue : undefined
  const sidebarFeedback = voteVariant === 'sidebar' ? voteFeedback : undefined
  const countLabelId = `sidebar-count-${post.id}`

  return (
    <div
      className={cn(
        'flex w-full bg-nosedive-gradient px-3 py-4 sm:px-6 sm:py-8 md:p-8 lg:p-10',
        embedded
          ? 'min-h-0 flex-col items-center py-4 sm:py-8'
          : 'min-h-dvh items-center justify-center px-4 py-6',
        className,
      )}
    >
      <div className="w-full max-w-6xl rounded-2xl border border-white/30 bg-white/20 p-4 text-nosedive-body shadow-2xl backdrop-blur-[2px] sm:rounded-[28px] sm:p-6 md:p-8 lg:p-10">
        <div className="grid grid-cols-12 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
          <div className="col-span-12 lg:col-span-9">
            <header className="mb-4 flex items-start gap-3 sm:mb-6 sm:gap-4">
              {profileHref ? (
                <Link
                  to={profileHref}
                  className="shrink-0 rounded-full outline-none ring-white/60 ring-offset-2 ring-offset-transparent transition hover:opacity-90 focus-visible:ring-2"
                >
                  <img
                    src={post.user.avatar}
                    alt=""
                    className="h-11 w-11 rounded-full border border-white/50 object-cover shadow-md sm:h-14 sm:w-14"
                  />
                </Link>
              ) : (
                <img
                  src={post.user.avatar}
                  alt=""
                  className="h-11 w-11 rounded-full border border-white/50 object-cover shadow-md sm:h-14 sm:w-14"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 text-nosedive-muted sm:gap-2">
                  {profileHref ? (
                    <Link
                      to={profileHref}
                      className="font-display text-lg font-light tracking-tight text-nosedive-muted transition hover:text-nosedive-title hover:underline sm:text-xl md:text-2xl"
                    >
                      <h2 className="inline font-display text-lg font-light tracking-tight sm:text-xl md:text-2xl">
                        {post.user.name}
                      </h2>
                    </Link>
                  ) : (
                    <h2 className="font-display text-lg font-light tracking-tight text-nosedive-muted sm:text-xl md:text-2xl">
                      {post.user.name}
                    </h2>
                  )}
                  <span className="font-display text-2xl font-light text-nosedive-title sm:text-3xl">
                    {post.user.rating}
                  </span>
                </div>
                <p className="mt-1 break-words font-display text-2xl font-extralight leading-tight tracking-tight text-nosedive-title sm:text-3xl md:text-4xl lg:text-5xl">
                  {post.title}
                </p>
                <div className="mt-3 h-0.5 w-16 rounded-full bg-nosedive-line" />
              </div>
            </header>

            <div className="grid grid-cols-12 gap-3 sm:gap-4">
              <div className="col-span-12 md:col-span-7">
                <div className="overflow-hidden rounded-lg bg-white/30 shadow-lg">
                  <img
                    src={post.images[0]}
                    alt=""
                    className="h-56 w-full object-cover brightness-105 contrast-95 sm:h-72 md:h-96 md:max-h-[420px] lg:h-[420px]"
                  />
                </div>
              </div>
              <div className="col-span-12 flex flex-col gap-3 sm:gap-4 md:col-span-5">
                <div className="overflow-hidden rounded-lg bg-white/30 shadow-lg">
                  <img
                    src={post.images[1]}
                    alt=""
                    className="h-36 w-full object-cover brightness-105 contrast-95 sm:h-40 md:h-[200px]"
                  />
                </div>
                <div className="overflow-hidden rounded-lg bg-white/30 shadow-lg">
                  <img
                    src={post.images[2]}
                    alt=""
                    className="h-36 w-full object-cover brightness-105 contrast-95 sm:h-40 md:h-[200px]"
                  />
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs font-light text-nosedive-muted opacity-90 sm:mt-4 sm:text-sm">
              {post.taggedPeople}
            </p>

            {voteVariant === 'inline' && onVote ? (
              <div
                className="mt-4 flex flex-col items-end gap-2 border-t border-white/25 pt-4"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="presentation"
              >
                <span
                  id={`inline-vote-label-${post.id}`}
                  className="text-xs font-light uppercase tracking-[0.2em] text-nosedive-muted"
                >
                  Avaliar
                </span>
                <VoteStarRow
                  value={voteValue ?? 0}
                  onChange={onVote}
                  labelledBy={`inline-vote-label-${post.id}`}
                />
                {voteFeedback ? (
                  <p className="max-w-sm text-right text-xs font-light italic text-nosedive-muted" role="status">
                    {voteFeedback}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <UserReputationSidebar
            data={post.sideRating}
            comments={post.comments}
            voteValue={sidebarVoteValue}
            onVote={sidebarOnVote}
            voteFeedback={sidebarFeedback}
            ratedCountLabel={ratedCountLabel}
            countLabelId={countLabelId}
            ratingSpotlights={ratingSpotlights}
            ratingSpotlightIntervalMs={ratingSpotlightIntervalMs}
          />
        </div>

        {cardFooterVote && onVote ? (
          <div
            className="mt-8 flex flex-col items-end gap-2 border-t border-white/25 pt-6"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <span
              id={`card-footer-vote-${post.id}`}
              className="text-xs font-light uppercase tracking-[0.2em] text-nosedive-muted"
            >
              Avaliar
            </span>
            <VoteStarRow
              value={voteValue ?? 0}
              onChange={onVote}
              labelledBy={`card-footer-vote-${post.id}`}
            />
            {voteFeedback ? (
              <p className="max-w-sm text-right text-xs font-light italic text-nosedive-muted" role="status">
                {voteFeedback}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
