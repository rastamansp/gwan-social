import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** `GET /me` — alinhado a `MeUserJson`. */
export class MeUserResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  username!: string

  @ApiProperty()
  displayName!: string

  @ApiProperty({ description: 'URL do avatar (string vazia se ausente)' })
  avatarUrl!: string

  @ApiProperty()
  headline!: string

  @ApiPropertyOptional({ nullable: true })
  bio!: string | null

  @ApiProperty()
  socialScore!: number

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { social: 4.2 },
  })
  reputationByContext!: Record<string, number>

  @ApiProperty({ example: '@laciepound', description: 'Handle com @' })
  handle!: string
}
