import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** Entrada de avaliação na lista `GET /users/:id/ratings/received`. */
export class ProfileRatedEntryDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  reviewerId!: string

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
