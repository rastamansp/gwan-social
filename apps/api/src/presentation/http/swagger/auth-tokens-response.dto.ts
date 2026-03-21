import { ApiProperty } from '@nestjs/swagger'

/** Resposta de register, login e refresh. */
export class AuthTokensResponseDto {
  @ApiProperty({ description: 'JWT de acesso (Bearer)' })
  accessToken!: string

  @ApiProperty({ description: 'Token opaco para renovar a sessão' })
  refreshToken!: string

  @ApiProperty({ description: 'TTL do access token em segundos', example: 900 })
  expiresIn!: number

  @ApiProperty({ enum: ['Bearer'], example: 'Bearer' })
  tokenType!: 'Bearer'
}
