import type { EditorialPost } from '@/data/mockUsers'
import { CommentPreviewList } from '@/components/social/CommentPreviewList'
import { ReputationStars } from '@/components/social/ReputationStars'
import { VoteStarRow } from '@/components/social/VoteStarRow'

interface UserReputationSidebarProps {
  data: EditorialPost['sideRating']
  comments: EditorialPost['comments']
  /** 0–5; usado com onVote para modo votação interativa */
  voteValue?: number
  onVote?: (stars: number) => void
  /** Sobrescreve o texto da linha de contagem (ex.: PT). */
  ratedCountLabel?: string
  /** Mensagem discreta após voto (mock). */
  voteFeedback?: string | null
  /** id único para a linha de contagem (vários cartões na mesma página). */
  countLabelId?: string
}

export function UserReputationSidebar({
  data,
  comments,
  voteValue = 0,
  onVote,
  ratedCountLabel,
  voteFeedback,
  countLabelId = 'sidebar-rating-count',
}: UserReputationSidebarProps) {
  const countLabel =
    ratedCountLabel ?? `${data.count} pessoas avaliaram esta foto`
  const voting = Boolean(onVote)

  return (
    <aside className="col-span-12 border-t border-white/20 pt-4 sm:pt-2 lg:col-span-3 lg:border-t-0 lg:pt-2">
      <div className="mb-4 flex items-center gap-2 font-light text-nosedive-body sm:mb-6">
        <span className="text-base italic sm:text-lg" aria-hidden>
          ★
        </span>
        <span id={countLabelId} className="text-xs italic text-nosedive-body sm:text-sm">
          {countLabel}
        </span>
      </div>

      <div className="mb-4 flex items-center gap-3 sm:mb-6">
        <img
          src={data.person.avatar}
          alt=""
          className="h-12 w-12 rounded-full object-cover shadow-md sm:h-14 sm:w-14"
        />
        <div className="min-w-0">
          <div className="truncate font-display text-lg font-light leading-tight text-nosedive-body sm:text-2xl">
            {data.person.name}
          </div>
          <div className="text-2xl font-light text-nosedive-body sm:text-3xl">{data.person.rating}</div>
        </div>
      </div>

      {voting ? (
        <div className="mb-10">
          <VoteStarRow
            value={voteValue}
            onChange={onVote!}
            labelledBy={countLabelId}
          />
          {voteFeedback ? (
            <p className="mt-3 text-sm font-light italic text-nosedive-muted" role="status">
              {voteFeedback}
            </p>
          ) : null}
        </div>
      ) : (
        <ReputationStars className="mb-10" />
      )}

      <CommentPreviewList comments={comments} italicTitle />
    </aside>
  )
}
