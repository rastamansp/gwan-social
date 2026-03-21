/** Contratos usados pelos componentes de feed / editorial (camada de apresentação). */

export interface UserProfile {
  id: string
  name: string
  handle: string
  avatar: string
  rating: number
  ratingCount: number
  bio: string
  tier: 'elite' | 'premium' | 'standard' | 'low'
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
  user: {
    name: string
    rating: string
    avatar: string
  }
  title: string
  images: [string, string, string]
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
