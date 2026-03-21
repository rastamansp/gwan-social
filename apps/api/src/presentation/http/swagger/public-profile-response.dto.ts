import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** Perfil público (`GET /users/:userId`) — alinhado a `publicUser` nos mappers. */
export class PublicProfileResponseDto {
  @ApiProperty({ example: 'user_001' })
  id!: string

  @ApiProperty({ example: 'laciepound' })
  username!: string

  @ApiProperty({ example: 'Lacie Pound' })
  displayName!: string

  @ApiPropertyOptional({ description: 'URL do avatar', nullable: true })
  avatarUrl?: string | null

  @ApiPropertyOptional({ nullable: true })
  headline?: string | null

  @ApiPropertyOptional({ nullable: true })
  bio?: string | null

  @ApiProperty({ description: 'Score agregado de contexto social (fallback 4)', example: 4.2 })
  socialScore!: number

  @ApiProperty({
    description: 'Scores por tipo de contexto de reputação',
    example: { social: 4.2, commerce: 4.5 },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  reputationByContext!: Record<string, number>
}
