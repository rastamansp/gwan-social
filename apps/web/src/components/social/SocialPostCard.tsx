import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { CommentItem } from '@/components/social/CommentPreviewList'
import type { EditorialPost } from '@/data/legacyFeed.types'
import type { RatingSpotlightPerson } from '@/data/socialPosts.index'
import { UserReputationSidebar } from '@/components/social/UserReputationSidebar'
import { cn } from '@/lib/utils'

function EditorialImageGrid({ images }: { images: string[] }) {
  const n = images.length
  if (n === 0) return null

  const tileClass =
    'overflow-hidden rounded-lg bg-white/30 shadow-lg [&_img]:brightness-105 [&_img]:contrast-95'

  if (n === 1) {
    return (
      <div className={tileClass}>
        <img
          src={images[0]}
          alt=""
          className="h-56 w-full object-cover sm:h-72 md:h-96 md:max-h-[420px] lg:h-[420px]"
        />
      </div>
    )
  }

  if (n === 2) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {images.map((src, i) => (
          <div key={`${i}-${src.slice(-24)}`} className={tileClass}>
            <img src={src} alt="" className="h-48 w-full object-cover sm:h-56 md:h-72" />
          </div>
        ))}
      </div>
    )
  }

  const [a, b, c, ...rest] = images
  return (
    <>
      <div className="grid grid-cols-12 gap-3 sm:gap-4">
        <div className="col-span-12 md:col-span-7">
          <div className={tileClass}>
            <img
              src={a}
              alt=""
              className="h-56 w-full object-cover sm:h-72 md:h-96 md:max-h-[420px] lg:h-[420px]"
            />
          </div>
        </div>
        <div className="col-span-12 flex flex-col gap-3 sm:gap-4 md:col-span-5">
          <div className={tileClass}>
            <img src={b} alt="" className="h-36 w-full object-cover sm:h-40 md:h-[200px]" />
          </div>
          <div className={tileClass}>
            <img src={c} alt="" className="h-36 w-full object-cover sm:h-40 md:h-[200px]" />
          </div>
        </div>
      </div>
      {rest.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
          {rest.map((src, i) => (
            <div key={`rest-${i}-${src.slice(-20)}`} className={tileClass}>
              <img src={src} alt="" className="aspect-square w-full object-cover sm:h-40 sm:max-h-52" />
            </div>
          ))}
        </div>
      ) : null}
    </>
  )
}

interface SocialPostCardProps {
  post: EditorialPost
  className?: string
  /** Quando true, não centraliza verticalmente (uso abaixo de header de detalhe). */
  embedded?: boolean
  /** Votação (1–5); com `onVote`, a UI fica na sidebar acima dos comentários. */
  voteValue?: number
  onVote?: (stars: number) => void
  voteFeedback?: string | null
  ratedCountLabel?: string
  /** Sequência para alternar o bloco “quem avaliou” com esmaecer (ex.: detalhe do post). */
  ratingSpotlights?: RatingSpotlightPerson[]
  /** Intervalo entre troca de spotlights (ms). */
  ratingSpotlightIntervalMs?: number
  /** Conteúdo extra no fim do cartão (ex.: ações e comentários na página de detalhe). */
  embeddedDetailSlot?: ReactNode
  /** Com `onVote` na sidebar: se definido, exige estrelas + botão Enviar (ex.: página `/post/:id`). */
  onVoteSubmit?: () => void
  voteSubmitting?: boolean
  voteSubmitDisabled?: boolean
  /** Aviso persistente no bloco de avaliação (ex.: não podes avaliar o teu post). */
  voteHint?: string | null
  /** Se definido, substitui `post.comments` na sidebar (ex.: dados da API com data). */
  sidebarComments?: CommentItem[]
  /** CTA quando `sidebarComments` está vazio (só usado com override). */
  sidebarCommentsEmptySlot?: ReactNode
  commentCurrentUserId?: string | null
  /** Sobrescreve `post.authorUserId` para permissão de apagar comentários como dono do post. */
  postAuthorUserId?: string | null
  onRequestDeleteComment?: (commentId: string) => void
  /** Compositor ou outro bloco sob o título «Comentários» na sidebar. */
  sidebarCommentsBelowTitleSlot?: ReactNode
  /** Botão ou ação à direita do título «Comentários (n)». */
  sidebarCommentsTitleTrailing?: ReactNode
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
  ratingSpotlights,
  ratingSpotlightIntervalMs,
  embeddedDetailSlot,
  onVoteSubmit,
  voteSubmitting = false,
  voteSubmitDisabled = false,
  voteHint,
  sidebarComments,
  sidebarCommentsEmptySlot,
  commentCurrentUserId,
  postAuthorUserId: postAuthorUserIdProp,
  onRequestDeleteComment,
  sidebarCommentsBelowTitleSlot,
  sidebarCommentsTitleTrailing,
}: SocialPostCardProps) {
  const authorId = post.authorUserId
  const postAuthorUserIdForComments = postAuthorUserIdProp ?? post.authorUserId ?? null
  const profileHref = authorId ? `/user/${authorId}` : null

  const sidebarOnVote = onVote
  const sidebarVoteValue = voteValue
  const sidebarFeedback = voteFeedback
  const countLabelId = `sidebar-count-${post.id}`
  const sidebarCommentItems = sidebarComments ?? post.comments
  const sidebarEmptySlot = sidebarComments !== undefined ? sidebarCommentsEmptySlot : undefined

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
                <p className="mt-1 max-w-3xl break-words whitespace-pre-wrap font-display text-2xl font-extralight leading-tight tracking-tight text-nosedive-title sm:text-3xl md:text-4xl lg:text-5xl">
                  {post.content}
                </p>
                <div className="mt-3 h-0.5 w-16 rounded-full bg-nosedive-line" />
              </div>
            </header>

            <EditorialImageGrid images={post.images} />

            <p className="mt-3 font-display text-xs font-light text-nosedive-muted opacity-90 sm:mt-4 sm:text-sm">
              {post.publishedAtLabel
                ? `Publicado em ${post.publishedAtLabel}`
                : post.taggedPeople}
            </p>
          </div>

          <UserReputationSidebar
            data={post.sideRating}
            comments={sidebarCommentItems}
            commentsEmptySlot={sidebarEmptySlot}
            voteValue={sidebarVoteValue}
            onVote={sidebarOnVote}
            voteFeedback={sidebarFeedback}
            onVoteSubmit={onVoteSubmit}
            voteSubmitting={voteSubmitting}
            voteSubmitDisabled={voteSubmitDisabled}
            voteHint={voteHint}
            ratedCountLabel={ratedCountLabel}
            countLabelId={countLabelId}
            ratingSpotlights={ratingSpotlights}
            ratingSpotlightIntervalMs={ratingSpotlightIntervalMs}
            commentCurrentUserId={commentCurrentUserId}
            postAuthorUserId={postAuthorUserIdForComments}
            onRequestDeleteComment={onRequestDeleteComment}
            commentsBelowTitleSlot={sidebarCommentsBelowTitleSlot}
            commentsTitleTrailing={sidebarCommentsTitleTrailing}
          />
        </div>

        {embeddedDetailSlot ? (
          <div className="mt-6 border-t border-white/20 pt-6 text-foreground">{embeddedDetailSlot}</div>
        ) : null}
      </div>
    </div>
  )
}
