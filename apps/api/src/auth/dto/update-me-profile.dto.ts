import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

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
  @MaxLength(2000)
  bio?: string
}
