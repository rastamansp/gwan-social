import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator'

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  displayName!: string

  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-z0-9_]+$/, { message: 'username: só letras minúsculas, números e underscore' })
  username!: string

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string

  @IsOptional()
  @IsString()
  @MaxLength(254)
  @ValidateIf((_, v) => typeof v === 'string' && v.trim().length > 0)
  @IsEmail({}, { message: 'email inválido' })
  email?: string
}
