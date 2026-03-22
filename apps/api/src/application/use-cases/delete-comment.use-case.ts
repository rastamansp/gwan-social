import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import type { SocialPost } from '../../types/socialPost.types'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { GetPostByIdUseCase } from './get-post-by-id.use-case'

export type DeleteCommentInput = {
  actorUserId: string
  postId: string
  commentId: string
}

@Injectable()
export class DeleteCommentUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getPostById: GetPostByIdUseCase,
  ) {}

  async execute(input: DeleteCommentInput): Promise<SocialPost> {
    const row = await this.prisma.comment.findUnique({
      where: { id: input.commentId },
      select: {
        id: true,
        postId: true,
        authorId: true,
        post: { select: { authorId: true } },
      },
    })
    if (!row) {
      throw new NotFoundException('Comentário não encontrado.')
    }
    if (row.postId !== input.postId) {
      throw new NotFoundException('Comentário não encontrado neste post.')
    }
    const isCommentAuthor = row.authorId === input.actorUserId
    const isPostOwner = row.post.authorId === input.actorUserId
    if (!isCommentAuthor && !isPostOwner) {
      throw new ForbiddenException('Não podes apagar este comentário.')
    }

    await this.prisma.comment.delete({ where: { id: input.commentId } })

    const updated = await this.getPostById.execute(input.postId)
    if (!updated) {
      throw new NotFoundException('Post não encontrado.')
    }
    return updated
  }
}
