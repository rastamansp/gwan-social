import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { buildMeUserDtoFromPrisma, type MeUserJson } from '../../auth/me-user.mapper'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { SocialScoreService } from '../../infrastructure/prisma/social-score.service'

export type UpdateMyProfileInput = {
  userId: string
  displayName: string
  username: string
  headline?: string
  bio?: string
  /** `undefined` = não alterar; string (pode ser vazia) = gravar ou limpar. */
  email?: string
}

@Injectable()
export class UpdateMyProfileUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socialScores: SocialScoreService,
  ) {}

  async execute(input: UpdateMyProfileInput): Promise<MeUserJson> {
    const displayName = input.displayName.trim()
    const username = input.username.trim().toLowerCase()
    const headlineTrimmed = input.headline?.trim()
    const headline = headlineTrimmed && headlineTrimmed.length > 0 ? headlineTrimmed : null
    const bioTrimmed = input.bio?.trim()
    const bio = bioTrimmed && bioTrimmed.length > 0 ? bioTrimmed : null

    const existing = await this.prisma.user.findUnique({ where: { id: input.userId } })
    if (!existing) {
      throw new NotFoundException('Utilizador não encontrado.')
    }

    const emailUpdate =
      input.email === undefined
        ? {}
        : { email: input.email.trim().length > 0 ? input.email.trim().toLowerCase() : null }

    try {
      await this.prisma.user.update({
        where: { id: input.userId },
        data: {
          displayName,
          username,
          headline,
          bio,
          ...emailUpdate,
        },
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = (e.meta?.target as string[] | undefined) ?? []
        if (target.includes('email')) {
          throw new UnprocessableEntityException('Este email já está em uso.')
        }
        throw new UnprocessableEntityException('Nome de utilizador já está em uso.')
      }
      throw e
    }

    const user = await this.prisma.user.findUnique({ where: { id: input.userId } })
    if (!user) {
      throw new NotFoundException('Utilizador não encontrado.')
    }

    const map = await this.socialScores.scoresForUserIds([user.id])
    return buildMeUserDtoFromPrisma(user, map.get(user.id) ?? 4)
  }
}
