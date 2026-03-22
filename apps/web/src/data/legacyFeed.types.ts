/** Contratos usados pelos componentes de feed / editorial (camada de apresentação). */

export interface UserProfile {
  id: string
  name: string
  handle: string
  avatar: string
  rating: number
  ratingCount: number
  /** Linha curta (coluna `headline` na API / BD). */
  headline: string
  bio: string
  tier: 'elite' | 'premium' | 'standard' | 'low'
  /** Email da conta (apenas sessão / `GET /me`; não exposto em perfis públicos). */
  email?: string
}

export interface Post {
  id: string
  userId: string
  content: string
  image?: string
  likes: number
  timestamp: string
  rating: number
}

export interface EditorialPost {
  id: string
  /** Quando definido (ex. posts da API), liga o avatar ao perfil correto sem depender do mock `posts`. */
  authorUserId?: string
  user: {
    name: string
    rating: string
    avatar: string
  }
  /** Texto da publicação (alinhado a `SocialPost.content`). */
  content: string
  /** URLs de imagem do post (sem duplicar a mesma foto para preencher layout). */
  images: string[]
  /** Data/hora de publicação legível (ex.: API → `socialPostToEditorial`). */
  publishedAtLabel?: string
  taggedPeople: string
  sideRating: {
    count: number
    person: {
      name: string
      rating: string
      avatar: string
    }
  }
  comments: { author: string; text: string }[]
}
