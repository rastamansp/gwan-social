import { ApiProperty } from '@nestjs/swagger'

/**
 * Corpo JSON padrão do Nest para `HttpException` (ex.: `throw new NotFoundException('…')`).
 * @see https://docs.nestjs.com/exception-filters#built-in-http-exceptions
 */
export class HttpExceptionResponseDto {
  @ApiProperty({ example: 404 })
  statusCode!: number

  @ApiProperty({ example: 'Utilizador não encontrado' })
  message!: string

  @ApiProperty({
    description: 'Etiqueta curta do estado HTTP',
    example: 'Not Found',
  })
  error!: string
}
