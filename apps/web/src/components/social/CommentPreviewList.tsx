import type { MouseEvent, ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { UserProfileHoverLink } from '@/components/social/user-tooltip-card'
import { formatRelativeTime } from '@/data/socialPosts.adapters'
import { cn } from '@/lib/utils'

export interface CommentItem {
  id?: string
  authorUserId?: string
  author: string
  text: string
  createdAt?: string
}

interface CommentPreviewListProps {
  title?: string
  /** Título em itálico (referência Nosedive). */
  italicTitle?: boolean
  comments: CommentItem[]
  className?: string
  compact?: boolean
  /** Conteúdo quando não há comentários (CTA login / abrir compositor). */
  emptySlot?: ReactNode
  /** Conteúdo logo abaixo do título (ex.: compositor na página de post). */
  belowTitleSlot?: ReactNode
  /** Alinhado à direita na mesma linha do título (ex.: botão «Comentar»). */
  titleTrailing?: ReactNode
  currentUserId?: string | null
  /** Autor do post: pode apagar qualquer comentário nesta lista. */
  postAuthorUserId?: string | null
  onRequestDeleteComment?: (commentId: string) => void
}

export function CommentPreviewList({
  title = 'Comentários',
  italicTitle,
  comments,
  className,
  compact,
  emptySlot,
  belowTitleSlot,
  titleTrailing,
  currentUserId,
  postAuthorUserId,
  onRequestDeleteComment,
}: CommentPreviewListProps) {
  return (
    <div className={cn(className)}>
      <div
        className={cn(
          'mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-display font-light text-nosedive-body',
          compact ? 'mb-2 text-base' : 'text-xl',
        )}
      >
        <div className="min-w-0">
          {italicTitle ? (
            <>
              <span className="italic">{title}</span> ({comments.length})
            </>
          ) : (
            <>
              {title} ({comments.length})
            </>
          )}
        </div>
        {titleTrailing ? <div className="shrink-0">{titleTrailing}</div> : null}
      </div>
      {belowTitleSlot ? (
        <div className={cn('mb-4', compact && 'mb-2')}>{belowTitleSlot}</div>
      ) : null}
      {comments.length === 0 ? (
        emptySlot ? (
          <div className={cn('text-sm text-nosedive-muted', compact && 'text-xs')}>{emptySlot}</div>
        ) : null
      ) : (
        <div
          className={cn(
            'max-h-[min(42vh,20rem)] overflow-y-auto overscroll-y-contain pr-1 sm:max-h-[min(45vh,22rem)]',
            '[scrollbar-gutter:stable]',
          )}
          role="region"
          aria-label="Lista de comentários"
        >
          <div className={cn('space-y-4 text-nosedive-muted', compact && 'space-y-2 text-sm')}>
          {comments.map((c, index) => {
            const isCommentAuthor =
              Boolean(c.authorUserId) && Boolean(currentUserId) && c.authorUserId === currentUserId
            const isPostOwner =
              Boolean(postAuthorUserId) && Boolean(currentUserId) && postAuthorUserId === currentUserId
            const canDelete =
              Boolean(c.id) && Boolean(currentUserId) && Boolean(onRequestDeleteComment) &&
              (isCommentAuthor || isPostOwner)
            return (
              <div key={c.id ?? `${c.author}-${index}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className={cn('font-medium text-nosedive-body', compact && 'text-xs')}>
                    {c.authorUserId ? (
                      <UserProfileHoverLink
                        userId={c.authorUserId}
                        profileHint={{ name: c.author }}
                        onClick={(e: MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
                        className="rounded-sm text-inherit outline-none transition hover:text-nosedive-title hover:underline focus-visible:ring-2 focus-visible:ring-nosedive-star/40 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
                      >
                        {c.author}
                      </UserProfileHoverLink>
                    ) : (
                      c.author
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {c.createdAt ? (
                      <time
                        className={cn('text-xs text-nosedive-muted', compact && 'text-[10px]')}
                        dateTime={c.createdAt}
                      >
                        {formatRelativeTime(c.createdAt)}
                      </time>
                    ) : null}
                    {canDelete ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRequestDeleteComment!(c.id!)
                        }}
                        className="rounded-md p-1 text-nosedive-muted transition hover:bg-white/15 hover:text-destructive"
                        aria-label="Apagar comentário"
                      >
                        <Trash2 size={compact ? 14 : 16} strokeWidth={1.75} />
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className={cn('mt-0.5 font-light', compact ? 'text-xs' : 'text-base')}>{c.text}</div>
              </div>
            )
          })}
          </div>
        </div>
      )}
    </div>
  )
}
