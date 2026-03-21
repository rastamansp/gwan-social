import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface VoteStarRowProps {
  /** 0 = ainda sem voto; 1–5 = voto selecionado */
  value: number
  onChange: (stars: number) => void
  disabled?: boolean
  className?: string
  /** id para associar legenda acessível */
  labelledBy?: string
}

/**
 * Votação interativa 1–5 estrelas (acento magenta / tom pastel).
 * Apenas UI — sem chamada API; o pai persiste estado se necessário.
 */
export function VoteStarRow({ value, onChange, disabled, className, labelledBy }: VoteStarRowProps) {
  const [hover, setHover] = useState<number | null>(null)
  const display = hover ?? value

  return (
    <div
      className={cn('flex flex-wrap gap-1.5 sm:gap-2', className)}
      role="group"
      aria-labelledby={labelledBy}
      aria-label="Avaliar de 1 a 5 estrelas"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= display
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => !disabled && setHover(star)}
            onBlur={() => setHover(null)}
            className={cn(
              'flex h-11 min-w-[2.25rem] items-center justify-center text-2xl leading-none transition-transform duration-150 sm:h-auto sm:min-w-0 sm:text-3xl md:text-4xl',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40',
              'rounded-md disabled:cursor-not-allowed disabled:opacity-40',
              !disabled && 'cursor-pointer active:scale-95',
              active
                ? 'text-nosedive-star drop-shadow-[0_0_14px_rgba(224,86,253,0.55)]'
                : 'text-muted-foreground/55',
            )}
            aria-pressed={star <= value}
            aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
