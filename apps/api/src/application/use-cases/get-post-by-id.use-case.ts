import { Injectable } from '@nestjs/common'
import type { SocialPost } from '../../types/socialPost.types'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { SocialScoreService } from '../../infrastructure/prisma/social-score.service'
import {
  socialPostFromPrisma,
  userIdsForPostScores,
  type PostWithFeedRelations,
} from '../mappers/prisma-post.mapper'

@Injectable()
export class GetPostByIdUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socialScores: SocialScoreService,
  ) {}

  async execute(postId: string): Promise<SocialPost | null> {
    const row = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        media: { orderBy: { position: 'asc' } },
        comments: { orderBy: { createdAt: 'desc' }, take: 20, include: { author: true } },
        ratings: { include: { reviewer: true }, orderBy: { createdAt: 'desc' }, take: 100 },
      },
    })
    if (!row) return null

    const author = await this.prisma.user.findUnique({ where: { id: row.authorId } })
    if (!author) return null

    const scoreMap = await this.socialScores.scoresForUserIds(
      userIdsForPostScores(author, row as PostWithFeedRelations),
    )
    const getScore = (id: string) => scoreMap.get(id) ?? 4

    return socialPostFromPrisma(row as PostWithFeedRelations, author, getScore)
  }
}
