import type { PrismaClient } from '@prisma/client'
import type { DomainRating } from './fixtures.types'

export async function seedRatings(prisma: PrismaClient, ratings: DomainRating[]): Promise<void> {
  for (const r of ratings) {
    await prisma.rating.upsert({
      where: { id: r.id },
      create: {
        id: r.id,
        reviewerId: r.reviewerId,
        revieweeId: r.revieweeId,
        postId: r.postId,
        value: r.value,
        comment: r.comment,
        createdAt: new Date(r.createdAt),
        contextType: r.contextType,
        interactionId: r.interactionId ?? null,
      },
      update: {
        reviewerId: r.reviewerId,
        revieweeId: r.revieweeId,
        postId: r.postId,
        value: r.value,
        comment: r.comment,
        createdAt: new Date(r.createdAt),
        contextType: r.contextType,
        interactionId: r.interactionId ?? null,
      },
    })
  }
}
