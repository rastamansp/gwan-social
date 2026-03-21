import { useEffect, useMemo, useState } from 'react'
import type { EditorialPost } from '@/data/mockUsers'
import type { RatingSpotlightPerson } from '@/data/socialPosts.index'
import { CommentPreviewList } from '@/components/social/CommentPreviewList'
import { ReputationStars } from '@/components/social/ReputationStars'
import { VoteStarRow } from '@/components/social/VoteStarRow'
import { cn } from '@/lib/utils'

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
  /** Alterna o bloco de avaliador com esmaecer (detalhe do post). */
  ratingSpotlights?: RatingSpotlightPerson[]
  ratingSpotlightIntervalMs?: number
}

const FADE_MS = 320
const DEFAULT_ROTATE_MS = 6500

function starsFromRatingString(rating: string): number {
  const n = Number.parseFloat(rating.replace(',', '.'))
  if (!Number.isFinite(n)) return 5
  return Math.min(5, Math.max(1, Math.round(n)))
}

export function UserReputationSidebar({
  data,
  comments,
  voteValue = 0,
  onVote,
  ratedCountLabel,
  voteFeedback,
  countLabelId = 'sidebar-rating-count',
  ratingSpotlights,
  ratingSpotlightIntervalMs = DEFAULT_ROTATE_MS,
}: UserReputationSidebarProps) {
  const countLabel =
    ratedCountLabel ?? `${data.count} pessoas avaliaram esta foto`
  const voting = Boolean(onVote)

  const rotateList = useMemo(() => {
    if (!ratingSpotlights || ratingSpotlights.length <= 1) return null
    return ratingSpotlights
  }, [ratingSpotlights])

  const [spotlightIndex, setSpotlightIndex] = useState(0)
  const [spotlightVisible, setSpotlightVisible] = useState(true)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const displayPerson =
    rotateList && !reduceMotion ? rotateList[spotlightIndex]! : rotateList?.[0] ?? data.person

  useEffect(() => {
    setSpotlightIndex(0)
    setSpotlightVisible(true)
  }, [rotateList])

  useEffect(() => {
    if (!rotateList || reduceMotion) return

    const tick = window.setInterval(() => {
      setSpotlightVisible(false)
    }, ratingSpotlightIntervalMs)

    return () => window.clearInterval(tick)
  }, [rotateList, ratingSpotlightIntervalMs, reduceMotion])

  useEffect(() => {
    if (spotlightVisible || !rotateList) return

    const t = window.setTimeout(() => {
      setSpotlightIndex((i) => (i + 1) % rotateList.length)
      setSpotlightVisible(true)
    }, FADE_MS)

    return () => window.clearTimeout(t)
  }, [spotlightVisible, rotateList])

  const starCount = starsFromRatingString(displayPerson.rating)

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

      <div
        className={cn(
          'mb-4 transition-opacity duration-300 ease-in-out motion-reduce:transition-none sm:mb-6',
          spotlightVisible ? 'opacity-100' : 'opacity-0',
        )}
        aria-live={rotateList ? 'polite' : undefined}
      >
        <div className="flex items-center gap-3">
          <img
            src={displayPerson.avatar}
            alt=""
            className="h-12 w-12 rounded-full object-cover shadow-md sm:h-14 sm:w-14"
          />
          <div className="min-w-0">
            <div className="truncate font-display text-lg font-light leading-tight text-nosedive-body sm:text-2xl">
              {displayPerson.name}
            </div>
            <div className="text-2xl font-light text-nosedive-body sm:text-3xl">{displayPerson.rating}</div>
          </div>
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
        <ReputationStars count={starCount} className="mb-10" />
      )}

      <CommentPreviewList comments={comments} italicTitle />
    </aside>
  )
}
