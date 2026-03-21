import { cn } from '@/lib/utils'

interface ReputationStarsProps {
  count?: number
  className?: string
}

/** Estrelas estilo frame Nosedive (menta); apenas visual. */
export function ReputationStars({ count = 5, className }: ReputationStarsProps) {
  return (
    <div className={cn('flex gap-2', className)} role="img" aria-label={`${count} estrelas`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-4xl leading-none text-nosedive-star">
          ★
        </span>
      ))}
    </div>
  )
}
