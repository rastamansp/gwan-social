/** Tipos partilhados para DTOs de perfil / avaliações (ex.: respostas da API). */

export interface ProfileRatedEntry {
  id: string
  reviewerId: string
  stars: 1 | 2 | 3 | 4 | 5
  comment: string
  postId: string | null
  postTitle: string | null
  createdAt: string
}

/** Avaliações feitas pelo utilizador (`GET .../ratings/given`). */
export interface ProfileRatingGivenEntry {
  id: string
  revieweeId: string
  stars: 1 | 2 | 3 | 4 | 5
  comment: string
  postId: string | null
  postTitle: string | null
  createdAt: string
}
