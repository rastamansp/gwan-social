import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { SocialScoreService } from '../../infrastructure/prisma/social-score.service'
import { publicUserFromPrisma, type PublicProfileDto } from '../mappers/profile.mappers'

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socialScores: SocialScoreService,
  ) {}

  async execute(userId: string): Promise<PublicProfileDto | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return null
    const map = await this.socialScores.scoresForUserIds([userId])
    const socialScore = map.get(userId) ?? 4
    return publicUserFromPrisma(user, socialScore)
  }
}
