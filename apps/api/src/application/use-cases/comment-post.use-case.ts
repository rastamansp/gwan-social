import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import type { SocialPost } from '../../types/socialPost.types'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { GetPostByIdUseCase } from './get-post-by-id.use-case'

const MAX_COMMENT_LENGTH = 2000

export type CommentPostInput = {
  postId: string
  authorUserId: string
  text: string
}

@Injectable()
export class CommentPostUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getPostById: GetPostByIdUseCase,
  ) {}

  async execute(input: CommentPostInput): Promise<SocialPost> {
    const trimmed = input.text.trim()
    if (!trimmed) {
      throw new BadRequestException('O comentário não pode ser vazio.')
    }
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      throw new BadRequestException(`O comentário não pode exceder ${MAX_COMMENT_LENGTH} caracteres.`)
    }

    const post = await this.prisma.post.findUnique({
      where: { id: input.postId },
      select: { id: true },
    })
    if (!post) {
      throw new NotFoundException('Post não encontrado.')
    }

    await this.prisma.comment.create({
      data: {
        id: randomUUID(),
        postId: input.postId,
        authorId: input.authorUserId,
        text: trimmed,
        createdAt: new Date(),
      },
    })

    const updated = await this.getPostById.execute(input.postId)
    if (!updated) {
      throw new NotFoundException('Post não encontrado.')
    }
    return updated
  }
}
