import type { PrismaClient } from '@prisma/client'
import type { DomainPostMedia } from './fixtures.types'

export async function seedPostMedia(prisma: PrismaClient, items: DomainPostMedia[]): Promise<void> {
  for (const m of items) {
    await prisma.postMedia.upsert({
      where: { id: m.id },
      create: {
        id: m.id,
        postId: m.postId,
        type: m.type,
        url: m.url,
        alt: m.alt ?? null,
        position: m.position,
      },
      update: {
        postId: m.postId,
        type: m.type,
        url: m.url,
        alt: m.alt ?? null,
        position: m.position,
      },
    })
  }
}
