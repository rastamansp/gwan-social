import { IsString, MaxLength, MinLength, Matches } from 'class-validator'

export class LoginDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-z0-9_]+$/, { message: 'username: só letras minúsculas, números e underscore' })
  username!: string

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string
}
