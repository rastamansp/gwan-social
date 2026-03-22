import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'

const DEFAULT_SCORE = 4

/**
 * Reputação “social” derivada da média das avaliações onde o utilizador é o avaliado (`revieweeId`).
 */
@Injectable()
export class SocialScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async scoresForUserIds(userIds: string[]): Promise<Map<string, number>> {
    const unique = [...new Set(userIds.filter(Boolean))]
    const map = new Map<string, number>()
    for (const id of unique) {
      map.set(id, DEFAULT_SCORE)
    }
    if (unique.length === 0) return map

    const rows = await this.prisma.rating.groupBy({
      by: ['revieweeId'],
      where: { revieweeId: { in: unique } },
      _avg: { value: true },
    })

    for (const r of rows) {
      const avg = r._avg.value
      map.set(
        r.revieweeId,
        avg != null ? Math.round(Number(avg) * 10) / 10 : DEFAULT_SCORE,
      )
    }
    return map
  }
}
