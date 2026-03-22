import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class CreateCommentDto {
  @ApiProperty({ example: 'Concordo totalmente!', maxLength: 2000, minLength: 1 })
  @IsString()
  @MinLength(1, { message: 'O comentário não pode ser vazio.' })
  @MaxLength(2000, { message: 'O comentário não pode exceder 2000 caracteres.' })
  text!: string
}
