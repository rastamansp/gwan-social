import type { UserProfile } from '@/data/legacyFeed.types'

export function getTierColor(tier: UserProfile['tier']) {
  switch (tier) {
    case 'elite':
      return 'text-rating-gold'
    case 'premium':
      return 'text-primary'
    case 'standard':
      return 'text-muted-foreground'
    case 'low':
      return 'text-rating-low'
  }
}

export function getTierLabel(tier: UserProfile['tier']) {
  switch (tier) {
    case 'elite':
      return 'Elite'
    case 'premium':
      return 'Premium'
    case 'standard':
      return 'Padrão'
    case 'low':
      return 'Baixo'
  }
}
