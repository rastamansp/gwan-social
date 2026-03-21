import { cn } from '@/lib/utils'

export interface CommentItem {
  author: string
  text: string
}

interface CommentPreviewListProps {
  title?: string
  /** Título em itálico (referência Nosedive). */
  italicTitle?: boolean
  comments: CommentItem[]
  className?: string
  compact?: boolean
}

export function CommentPreviewList({
  title = 'Comentários',
  italicTitle,
  comments,
  className,
  compact,
}: CommentPreviewListProps) {
  return (
    <div className={cn(className)}>
      <div
        className={cn(
          'font-display font-light text-nosedive-body',
          compact ? 'mb-2 text-base' : 'mb-4 text-xl',
        )}
      >
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
      <div className={cn('space-y-4 text-nosedive-muted', compact && 'space-y-2 text-sm')}>
        {comments.map((c, index) => (
          <div key={`${c.author}-${index}`}>
            <div className={cn('font-medium text-nosedive-body', compact && 'text-xs')}>
              {c.author}
            </div>
            <div className={cn('font-light', compact ? 'text-xs' : 'text-base')}>{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
