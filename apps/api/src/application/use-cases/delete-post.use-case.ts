import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

export type DeletePostInput = {
  actorUserId: string
  postId: string
}

@Injectable()
export class DeletePostUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: DeletePostInput): Promise<void> {
    const row = await this.prisma.post.findUnique({
      where: { id: input.postId },
      select: { id: true, authorId: true },
    })
    if (!row) {
      throw new NotFoundException('Post não encontrado.')
    }
    if (row.authorId !== input.actorUserId) {
      throw new ForbiddenException('Não podes apagar publicações de outro utilizador.')
    }

    await this.prisma.post.delete({ where: { id: input.postId } })
  }
}
