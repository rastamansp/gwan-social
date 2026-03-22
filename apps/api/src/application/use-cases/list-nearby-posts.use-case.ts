import { Injectable } from '@nestjs/common'
import type { SocialPost } from '../../types/socialPost.types'
import { clampLimit, paginateByIndex, type PaginatedResult } from '../shared/pagination'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { SocialScoreService } from '../../infrastructure/prisma/social-score.service'
import {
  socialPostFromPrisma,
  userIdsForPostScores,
  type PostWithFeedRelations,
} from '../mappers/prisma-post.mapper'

export interface ListNearbyPostsInput {
  limit?: string
  cursor?: string
}

export type NearbyPostRow = { post: SocialPost; distanceKm: number }

const nearbyInclude = {
  author: true,
  media: { orderBy: { position: 'asc' as const } },
  comments: { orderBy: { createdAt: 'desc' as const }, take: 20, include: { author: true } },
  ratings: { include: { reviewer: true }, orderBy: { createdAt: 'desc' as const }, take: 100 },
} as const

/**
 * Lista posts recentes com `distanceKm` placeholder (sem geolocalização real na BD).
 */
@Injectable()
export class ListNearbyPostsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socialScores: SocialScoreService,
  ) {}

  async execute(input: ListNearbyPostsInput): Promise<PaginatedResult<NearbyPostRow>> {
    const lim = clampLimit(input.limit)

    const rows = await this.prisma.post.findMany({
      take: 200,
      orderBy: { createdAt: 'desc' },
      include: nearbyInclude,
    })

    const allUserIds = new Set<string>()
    for (const row of rows) {
      const { author, ...rest } = row
      for (const id of userIdsForPostScores(author, rest as PostWithFeedRelations)) {
        allUserIds.add(id)
      }
    }
    const scoreMap = await this.socialScores.scoresForUserIds([...allUserIds])
    const getScore = (id: string) => scoreMap.get(id) ?? 4

    const combined: NearbyPostRow[] = rows.map((row, i) => {
      const { author, ...rest } = row
      return {
        post: socialPostFromPrisma(rest as PostWithFeedRelations, author, getScore),
        distanceKm: Math.round((1 + i * 0.35) * 10) / 10,
      }
    })

    return paginateByIndex(combined, input.cursor, lim)
  }
}
