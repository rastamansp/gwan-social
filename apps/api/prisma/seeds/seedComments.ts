import type { PrismaClient } from '@prisma/client'
import type { DomainComment } from './fixtures.types'

export async function seedComments(prisma: PrismaClient, comments: DomainComment[]): Promise<void> {
  for (const c of comments) {
    await prisma.comment.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        postId: c.postId,
        authorId: c.authorId,
        text: c.text,
        createdAt: new Date(c.createdAt),
      },
      update: {
        postId: c.postId,
        authorId: c.authorId,
        text: c.text,
        createdAt: new Date(c.createdAt),
      },
    })
  }
}
