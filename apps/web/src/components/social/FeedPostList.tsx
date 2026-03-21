import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SocialPostCard } from '@/components/social/SocialPostCard'
import { useSessionUser } from '@/contexts/SessionUserContext'
import { buildFallbackEditorial, getEditorialForPost, posts } from '@/data/mockUsers'
import { cn } from '@/lib/utils'

/** Listagem editorial (Nosedive) — cartões com votação 1–5 no canto inferior direito da área principal (mock). */
export function FeedPostList() {
  const { profile: sessionProfile, resolveUser } = useSessionUser()
  const navigate = useNavigate()
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [voteFeedbackByPost, setVoteFeedbackByPost] = useState<Record<string, string | null>>({})

  const items = useMemo(() => {
    return posts
      .map((post) => {
        const author = resolveUser(post.userId)
        if (!author) return null
        const editorial =
          getEditorialForPost(post.id) ?? buildFallbackEditorial(post, author, sessionProfile)
        return { post, editorial }
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
  }, [resolveUser, sessionProfile])

  const handleVote = (postId: string, stars: number) => {
    setVotes((v) => ({ ...v, [postId]: stars }))
    setVoteFeedbackByPost((f) => ({
      ...f,
      [postId]: 'Voto registado (demonstração). Obrigado.',
    }))
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-2 py-4 sm:space-y-6 sm:px-4 sm:py-6 md:space-y-8">
      {items.map(({ post, editorial }) => (
        <div
          key={post.id}
          role="link"
          tabIndex={0}
          className={cn(
            'block cursor-pointer rounded-2xl outline-none transition-opacity hover:opacity-[0.98] sm:rounded-3xl md:rounded-[32px]',
            'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
          )}
          onClick={() => navigate(`/post/${post.id}`)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              navigate(`/post/${post.id}`)
            }
          }}
        >
          <SocialPostCard
            post={editorial}
            embedded
            voteVariant="inline"
            voteValue={votes[post.id] ?? 0}
            onVote={(n) => handleVote(post.id, n)}
            voteFeedback={voteFeedbackByPost[post.id] ?? null}
          />
        </div>
      ))}
    </div>
  )
}
