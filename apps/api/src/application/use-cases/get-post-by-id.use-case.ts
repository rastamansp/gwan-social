import { Inject, Injectable } from '@nestjs/common'
import type { SocialPost } from '../../types/socialPost.types'
import type { FixtureReadModelPort } from '../ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../ports/fixture-read-model.token'
import { socialPostFromPrisma } from '../mappers/prisma-post.mapper'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

@Injectable()
export class GetPostByIdUseCase {
  constructor(
    @Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(postId: string): Promise<SocialPost | null> {
    const h = this.fixtures.getHydrated()
    const fromFixture = h.socialPosts.find((p) => p.id === postId)
    if (fromFixture) return fromFixture

    const row = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        media: { orderBy: { position: 'asc' } },
        comments: { orderBy: { createdAt: 'asc' }, take: 20, include: { author: true } },
        ratings: { include: { reviewer: true }, orderBy: { createdAt: 'desc' }, take: 100 },
      },
    })
    if (!row) return null

    const author = await this.prisma.user.findUnique({ where: { id: row.authorId } })
    if (!author) return null

    return socialPostFromPrisma(row, author, h)
  }
}
