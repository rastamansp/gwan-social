import { Injectable } from '@nestjs/common'
import type { SocialPost } from '../../types/socialPost.types'
import {
  clampLimit,
  encodeIndexCursor,
  parseIndexCursor,
  type PaginatedResult,
} from '../shared/pagination'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { SocialScoreService } from '../../infrastructure/prisma/social-score.service'
import {
  socialPostFromPrisma,
  userIdsForPostScores,
  type PostWithFeedRelations,
} from '../mappers/prisma-post.mapper'

export interface GetFeedInput {
  limit?: string
  cursor?: string
}

const feedPostInclude = {
  author: true,
  media: { orderBy: { position: 'asc' as const } },
  comments: { orderBy: { createdAt: 'desc' as const }, take: 20, include: { author: true } },
  ratings: { include: { reviewer: true }, orderBy: { createdAt: 'desc' as const }, take: 100 },
} as const

@Injectable()
export class GetFeedUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socialScores: SocialScoreService,
  ) {}

  async execute(input: GetFeedInput): Promise<PaginatedResult<SocialPost>> {
    const lim = clampLimit(input.limit)
    const start = parseIndexCursor(input.cursor)

    const rows = await this.prisma.post.findMany({
      skip: start,
      take: lim + 1,
      orderBy: { createdAt: 'desc' },
      include: feedPostInclude,
    })

    const hasMore = rows.length > lim
    const pageRows = hasMore ? rows.slice(0, lim) : rows

    const allUserIds = new Set<string>()
    for (const row of pageRows) {
      const { author, ...rest } = row
      for (const id of userIdsForPostScores(author, rest as PostWithFeedRelations)) {
        allUserIds.add(id)
      }
    }
    const scoreMap = await this.socialScores.scoresForUserIds([...allUserIds])
    const getScore = (id: string) => scoreMap.get(id) ?? 4

    const items = pageRows.map((row) => {
      const { author, ...rest } = row
      return socialPostFromPrisma(rest as PostWithFeedRelations, author, getScore)
    })

    const nextIndex = start + pageRows.length
    return {
      items,
      nextCursor: hasMore ? encodeIndexCursor(nextIndex) : null,
      hasMore,
    }
  }
}
