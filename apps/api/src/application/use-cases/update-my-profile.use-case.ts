import { Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { buildMeUserDtoFromPrisma, type MeUserJson } from '../../auth/me-user.mapper'
import type { FixtureReadModelPort } from '../ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../ports/fixture-read-model.token'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

export type UpdateMyProfileInput = {
  userId: string
  displayName: string
  username: string
  bio?: string
}

@Injectable()
export class UpdateMyProfileUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort,
  ) {}

  async execute(input: UpdateMyProfileInput): Promise<MeUserJson> {
    const displayName = input.displayName.trim()
    const username = input.username.trim().toLowerCase()
    const bioTrimmed = input.bio?.trim()
    const bio = bioTrimmed && bioTrimmed.length > 0 ? bioTrimmed : null

    const existing = await this.prisma.user.findUnique({ where: { id: input.userId } })
    if (!existing) {
      throw new NotFoundException('Utilizador não encontrado.')
    }

    try {
      await this.prisma.user.update({
        where: { id: input.userId },
        data: {
          displayName,
          username,
          bio,
        },
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new UnprocessableEntityException('Nome de utilizador já está em uso.')
      }
      throw e
    }

    const user = await this.prisma.user.findUnique({ where: { id: input.userId } })
    if (!user) {
      throw new NotFoundException('Utilizador não encontrado.')
    }

    const h = this.fixtures.getHydrated()
    return buildMeUserDtoFromPrisma(user, h)
  }
}
