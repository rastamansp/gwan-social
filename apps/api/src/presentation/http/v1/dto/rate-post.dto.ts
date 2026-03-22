import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Max, Min } from 'class-validator'

export class RatePostDto {
  @ApiProperty({ example: 4, minimum: 1, maximum: 5, description: 'Número de estrelas (1–5).' })
  @IsInt({ message: 'O valor deve ser um número inteiro.' })
  @Min(1, { message: 'A avaliação mínima é 1.' })
  @Max(5, { message: 'A avaliação máxima é 5.' })
  value!: number
}
