import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** Entrada de avaliação na lista `GET /users/:id/ratings/given` (o utilizador é o avaliador). */
export class ProfileRatingGivenEntryDto {
  @ApiProperty()
  id!: string

  @ApiProperty({ description: 'Utilizador avaliado (autor do post ou alvo da avaliação).' })
  revieweeId!: string

  @ApiProperty({ enum: [1, 2, 3, 4, 5] })
  stars!: 1 | 2 | 3 | 4 | 5

  @ApiProperty()
  comment!: string

  @ApiPropertyOptional({ nullable: true })
  postId!: string | null

  @ApiPropertyOptional({ nullable: true })
  postTitle!: string | null

  @ApiProperty({ description: 'ISO 8601' })
  createdAt!: string
}
