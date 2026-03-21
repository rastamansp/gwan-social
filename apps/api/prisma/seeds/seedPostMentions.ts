import type { PrismaClient } from '@prisma/client'
import type { DomainPostMention } from './fixtures.types'

export async function seedPostMentions(
  prisma: PrismaClient,
  mentions: DomainPostMention[],
): Promise<void> {
  for (const pm of mentions) {
    await prisma.postMention.upsert({
      where: {
        postId_userId: {
          postId: pm.postId,
          userId: pm.userId,
        },
      },
      create: {
        postId: pm.postId,
        userId: pm.userId,
      },
      update: {},
    })
  }
}
