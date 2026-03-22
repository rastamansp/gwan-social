import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator'

/** Corpo de `PATCH /me` — atualiza perfil do utilizador autenticado (sem upload de ficheiros). */
export class UpdateMeProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  displayName!: string

  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-z0-9_]+$/, { message: 'username: só letras minúsculas, números e underscore' })
  username!: string

  @IsOptional()
  @IsString()
  @MaxLength(280)
  headline?: string

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string

  /** Omitir para não alterar; string vazia remove o email. */
  @IsOptional()
  @IsString()
  @MaxLength(254)
  @ValidateIf((_, v) => typeof v === 'string' && v.trim().length > 0)
  @IsEmail({}, { message: 'email inválido' })
  email?: string
}
