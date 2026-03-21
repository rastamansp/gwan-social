/** Tipos partilhados pelos fixtures JSON (evita ciclos entre módulos de dados). */

export interface ProfileRatedEntry {
  id: string
  reviewerId: string
  stars: 1 | 2 | 3 | 4 | 5
  comment: string
  postId: string | null
  postTitle: string | null
  createdAt: string
}
