import { Inject, Injectable } from '@nestjs/common'
import type { FixtureReadModelPort } from '../ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../ports/fixture-read-model.token'
import { publicUser, publicUserFromPrisma, type PublicProfileDto } from '../mappers/profile.mappers'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(userId: string): Promise<PublicProfileDto | null> {
    const h = this.fixtures.getHydrated()
    const fromFixture = publicUser(h, userId)
    if (fromFixture) return fromFixture
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return null
    return publicUserFromPrisma(user, h)
  }
}
