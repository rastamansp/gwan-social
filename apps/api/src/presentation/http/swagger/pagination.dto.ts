import { ApiProperty } from '@nestjs/swagger'
import { ProfileRatingGivenEntryDto } from './profile-rating-given-entry.dto'
import { ProfileRatedEntryDto } from './profile-rated-entry.dto'
import { PublicProfileResponseDto } from './public-profile-response.dto'
import { SocialPostDto } from './social-post-response.dto'

const cursorDesc =
  'Cursor opaco (base64url) para a página seguinte; omitir na primeira página. Inválido volta ao início da lista.'

const limitFeedPostsDesc =
  'Número de itens (1–50; omissão 20). Feed e posts do utilizador / nearby / ratings usam estes limites.'

const limitFriendsDesc =
  'Número de IDs (1–100; omissão 50). Lista paginada de amigos aceites.'

const limitUsersDirectoryDesc =
  'Número de utilizadores por página (1–100; omissão 50). Ordenação: nome de exibição, depois id.'

/** Página de posts (`feed`, `posts/nearby`, `users/:id/posts`). */
export class PaginatedSocialPostDto {
  @ApiProperty({ type: [SocialPostDto] })
  items!: SocialPostDto[]

  @ApiProperty({
    nullable: true,
    description: 'Ausente ou null quando não há mais páginas.',
    example: 'eyJpIjoyMH0',
  })
  nextCursor!: string | null

  @ApiProperty()
  hasMore!: boolean
}

/** Página de avaliações recebidas. */
export class PaginatedProfileRatedEntryDto {
  @ApiProperty({ type: [ProfileRatedEntryDto] })
  items!: ProfileRatedEntryDto[]

  @ApiProperty({ nullable: true, example: 'eyJpIjo1MH0' })
  nextCursor!: string | null

  @ApiProperty()
  hasMore!: boolean
}

/** Página de avaliações feitas pelo utilizador (`GET /users/:id/ratings/given`). */
export class PaginatedProfileRatingGivenEntryDto {
  @ApiProperty({ type: [ProfileRatingGivenEntryDto] })
  items!: ProfileRatingGivenEntryDto[]

  @ApiProperty({ nullable: true, example: 'eyJpIjo1MH0' })
  nextCursor!: string | null

  @ApiProperty()
  hasMore!: boolean
}

/** Página de perfis públicos (`GET /users`). */
export class PaginatedPublicProfileDto {
  @ApiProperty({ type: [PublicProfileResponseDto] })
  items!: PublicProfileResponseDto[]

  @ApiProperty({
    nullable: true,
    description: 'Ausente ou null quando não há mais páginas.',
    example: 'eyJpIjo1MH0',
  })
  nextCursor!: string | null

  @ApiProperty()
  hasMore!: boolean
}

/** Página de IDs de amigos (`users/:id/friends`). */
export class PaginatedFriendIdsDto {
  @ApiProperty({ type: String, isArray: true, description: 'IDs de utilizadores (amizade aceite)' })
  items!: string[]

  @ApiProperty({ nullable: true })
  nextCursor!: string | null

  @ApiProperty()
  hasMore!: boolean
}

export { cursorDesc, limitFeedPostsDesc, limitFriendsDesc, limitUsersDirectoryDesc }
