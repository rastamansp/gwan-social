import { Injectable } from '@nestjs/common'
import type { SocialPost } from '../../types/socialPost.types'
import { socialPostFromPrisma, userIdsForPostScores, type PostWithFeedRelations } from '../mappers/prisma-post.mapper'
import { orderPostsForFeed } from '../shared/feed-order'
import { clampLimit, paginateByIndex, type PaginatedResult } from '../shared/pagination'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { SocialScoreService } from '../../infrastructure/prisma/social-score.service'

export interface ListUserPostsInput {
  userId: string
  limit?: string
  cursor?: string
}

@Injectable()
export class ListUserPostsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socialScores: SocialScoreService,
  ) {}

  async execute(input: ListUserPostsInput): Promise<PaginatedResult<SocialPost> | null> {
    const lim = clampLimit(input.limit)

    const exists = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true },
    })
    if (!exists) return null

    const author = await this.prisma.user.findUnique({ where: { id: input.userId } })
    if (!author) return null

    const rows = await this.prisma.post.findMany({
      where: { authorId: input.userId },
      include: {
        media: { orderBy: { position: 'asc' } },
        comments: { orderBy: { createdAt: 'desc' }, take: 20, include: { author: true } },
        ratings: { include: { reviewer: true }, orderBy: { createdAt: 'desc' }, take: 100 },
      },
      orderBy: { createdAt: 'desc' },
    })

    const allUserIds = new Set<string>()
    for (const row of rows) {
      for (const id of userIdsForPostScores(author, row as PostWithFeedRelations)) {
        allUserIds.add(id)
      }
    }
    const scoreMap = await this.socialScores.scoresForUserIds([...allUserIds])
    const getScore = (id: string) => scoreMap.get(id) ?? 4

    const socialPosts = rows.map((row) =>
      socialPostFromPrisma(row as PostWithFeedRelations, author, getScore),
    )
    const ordered = orderPostsForFeed(socialPosts)
    return paginateByIndex(ordered, input.cursor, lim)
  }
}
