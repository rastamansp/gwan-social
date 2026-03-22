import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import type { SocialPost } from '../../types/socialPost.types'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { GetPostByIdUseCase } from './get-post-by-id.use-case'

/** Contexto de avaliação em post social (reputação do autor como `reviewee`). */
export const RATING_CONTEXT_SOCIAL = 'social'

export type RatePostInput = {
  postId: string
  reviewerUserId: string
  value: number
}

@Injectable()
export class RatePostUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getPostById: GetPostByIdUseCase,
  ) {}

  async execute(input: RatePostInput): Promise<SocialPost> {
    const v = Math.round(Number(input.value))
    if (!Number.isFinite(v) || v < 1 || v > 5) {
      throw new BadRequestException('A avaliação deve ser um inteiro entre 1 e 5.')
    }

    const post = await this.prisma.post.findUnique({
      where: { id: input.postId },
      select: { id: true, authorId: true },
    })
    if (!post) {
      throw new NotFoundException('Post não encontrado.')
    }
    if (post.authorId === input.reviewerUserId) {
      throw new ForbiddenException('Não podes avaliar o teu próprio post.')
    }

    const existing = await this.prisma.rating.findFirst({
      where: { postId: input.postId, reviewerId: input.reviewerUserId },
      select: { id: true },
    })

    if (existing) {
      await this.prisma.rating.update({
        where: { id: existing.id },
        data: {
          value: v,
          revieweeId: post.authorId,
          createdAt: new Date(),
        },
      })
    } else {
      await this.prisma.rating.create({
        data: {
          id: randomUUID(),
          reviewerId: input.reviewerUserId,
          revieweeId: post.authorId,
          postId: input.postId,
          value: v,
          comment: '',
          createdAt: new Date(),
          contextType: RATING_CONTEXT_SOCIAL,
          interactionId: null,
        },
      })
    }

    const updated = await this.getPostById.execute(input.postId)
    if (!updated) {
      throw new NotFoundException('Post não encontrado.')
    }
    return updated
  }
}
