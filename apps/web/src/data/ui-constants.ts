/** Imagens de fallback para UI editorial (sem carregar fixtures JSON). */
export const fallbackEditorialImages = {
  main: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop',
  side: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
  avatarFallback: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
} as const

export const AVATAR_FALLBACK = fallbackEditorialImages.avatarFallback

/** Barras de contexto de reputação na sidebar de perfil (placeholder até haver dados na API). */
export const sidebarReputationContext: [string, string][] = [
  ['Social', '4.2'],
  ['Profissional', '4.0'],
  ['Eventos', '3.8'],
]

export const profileDashboardStatsDefault = { photos: 12, rated: 24, friendsLabel: '128' }

/** Bloco “destaque” na secção Momentos do perfil (copy estática; não depende de fixtures JSON). */
export const featuredMomentRating = {
  extraRatingsLabel: '+19 avaliações',
  filledStars: 2,
  quote:
    'Incrível, belo momento. Adorei a atmosfera e as conexões. Definitivamente inesquecível.',
} as const
