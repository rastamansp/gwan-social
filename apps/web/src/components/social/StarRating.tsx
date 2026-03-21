import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRate?: (value: number) => void
}

const sizeMap = { sm: 14, md: 18, lg: 24 }

export function StarRating({ rating, size = 'md', interactive = false, onRate }: StarRatingProps) {
  const s = sizeMap[size]

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star
        const half = !filled && rating >= star - 0.5
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(star)}
            className={cn(
              'transition-transform duration-150',
              interactive && 'cursor-pointer hover:scale-110 active:scale-95',
              !interactive && 'cursor-default',
            )}
          >
            <Star
              size={s}
              className={cn(
                'transition-colors duration-200',
                filled
                  ? 'fill-rating-gold text-rating-gold'
                  : half
                    ? 'fill-rating-gold/50 text-rating-gold'
                    : 'fill-transparent text-border',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
