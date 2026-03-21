import { Inject, Injectable } from '@nestjs/common'
import type { SocialPost } from '../../types/socialPost.types'
import type { FixtureReadModelPort } from '../ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../ports/fixture-read-model.token'
import { socialPostFromPrisma } from '../mappers/prisma-post.mapper'
import { orderPostsForFeed } from '../../infrastructure/fixtures/feedOrder'
import { postsByAuthorOrdered } from '../mappers/profile.mappers'
import { clampLimit, paginateByIndex, type PaginatedResult } from '../shared/pagination'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

export interface ListUserPostsInput {
  userId: string
  limit?: string
  cursor?: string
}

@Injectable()
export class ListUserPostsUseCase {
  constructor(
    @Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: ListUserPostsInput): Promise<PaginatedResult<SocialPost> | null> {
    const h = this.fixtures.getHydrated()
    const lim = clampLimit(input.limit)

    if (h.domain.users.some((u) => u.id === input.userId)) {
      const ordered = postsByAuthorOrdered(h.socialPosts, input.userId)
      return paginateByIndex(ordered, input.cursor, lim)
    }

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
        comments: { orderBy: { createdAt: 'asc' }, take: 20, include: { author: true } },
        ratings: { include: { reviewer: true }, orderBy: { createdAt: 'desc' }, take: 100 },
      },
      orderBy: { createdAt: 'desc' },
    })

    const socialPosts = rows.map((row) => socialPostFromPrisma(row, author, h))
    const ordered = orderPostsForFeed(socialPosts)
    return paginateByIndex(ordered, input.cursor, lim)
  }
}
