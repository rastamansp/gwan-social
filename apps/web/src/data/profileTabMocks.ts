import type { UserProfile } from '@/data/legacyFeed.types'

/** Avaliações recebidas pelo utilizador do perfil mock (ex.: Lacie) — posts ou perfil. */
export interface ProfileRatedEntry {
  id: string
  reviewerId: string
  stars: 1 | 2 | 3 | 4 | 5
  comment: string
  postId: string | null
  postTitle: string | null
  createdAt: string
}

export const profileRatedEntries: ProfileRatedEntry[] = [
  {
    id: 'rev_001',
    reviewerId: 'user_002',
    stars: 5,
    comment: 'Love this little break x',
    postId: 'post_001',
    postTitle: 'Brushed Suede w/Cookie Heaven!',
    createdAt: '2026-03-20T09:02:00Z',
  },
  {
    id: 'rev_002',
    reviewerId: 'user_003',
    stars: 5,
    comment: 'A moment to live for :)',
    postId: 'post_001',
    postTitle: 'Brushed Suede w/Cookie Heaven!',
    createdAt: '2026-03-20T09:20:00Z',
  },
  {
    id: 'rev_003',
    reviewerId: 'user_007',
    stars: 4,
    comment: 'Composição linda — a luz no café ficou perfeita.',
    postId: 'post_001',
    postTitle: 'Brushed Suede w/Cookie Heaven!',
    createdAt: '2026-03-19T18:00:00Z',
  },
  {
    id: 'rev_004',
    reviewerId: 'user_011',
    stars: 5,
    comment: 'Perfil muito coerente com o teu estilo no lago. Adoro.',
    postId: null,
    postTitle: null,
    createdAt: '2026-03-18T14:22:00Z',
  },
  {
    id: 'rev_005',
    reviewerId: 'user_015',
    stars: 5,
    comment: 'Inspiradora. Manténs um padrão elevadíssimo.',
    postId: null,
    postTitle: null,
    createdAt: '2026-03-17T10:05:00Z',
  },
  {
    id: 'rev_006',
    reviewerId: 'user_008',
    stars: 4,
    comment: 'Conteúdo honesto e bem editado.',
    postId: null,
    postTitle: null,
    createdAt: '2026-03-16T21:30:00Z',
  },
  {
    id: 'rev_007',
    reviewerId: 'user_014',
    stars: 5,
    comment: 'Fotos com alma. Quero colaborar num próximo evento.',
    postId: null,
    postTitle: null,
    createdAt: '2026-03-15T08:15:00Z',
  },
  {
    id: 'rev_008',
    reviewerId: 'user_016',
    stars: 4,
    comment: 'Boa energia no feed. Continua.',
    postId: null,
    postTitle: null,
    createdAt: '2026-03-14T16:40:00Z',
  },
]

/** Ordem fixa de amigos no mock (ids presentes na coleção social → `users`). */
const PROFILE_FRIEND_USER_IDS: string[] = [
  'user_002',
  'user_003',
  'user_006',
  'user_010',
  'user_013',
  'user_014',
  'user_017',
  'user_020',
  'user_022',
]

export function buildProfileFriendsList(
  allUsers: UserProfile[],
  currentUserId: string,
): UserProfile[] {
  return PROFILE_FRIEND_USER_IDS.map((id) => allUsers.find((u) => u.id === id)).filter(
    (u): u is UserProfile => Boolean(u && u.id !== currentUserId),
  )
}
