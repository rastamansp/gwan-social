/** Modos de ordenação da página Ranking (`?rank=`). */

export const RANKING_MODES = [
  {
    id: 'reputation' as const,
    label: 'Reputação',
    hint: 'Ordenado pela média global de estrelas.',
  },
  {
    id: 'volume' as const,
    label: 'Volume',
    hint: 'Quem acumula mais avaliações na rede (mock).',
  },
  {
    id: 'tier' as const,
    label: 'Nível',
    hint: 'Elite primeiro, depois Premium, Padrão e Basic; desempate pela média.',
  },
  {
    id: 'engagement' as const,
    label: 'Engajamento',
    hint: 'Combinação nota × log(1 + avaliações) — mock de “força” na comunidade.',
  },
]

export type RankingMode = (typeof RANKING_MODES)[number]['id']

export const RANKING_MODE_IDS = RANKING_MODES.map((m) => m.id)

export function parseRankingMode(searchParams: URLSearchParams): RankingMode {
  const r = searchParams.get('rank')
  return RANKING_MODE_IDS.includes(r as RankingMode) ? (r as RankingMode) : 'reputation'
}
