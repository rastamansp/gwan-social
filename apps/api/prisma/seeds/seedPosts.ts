import { Prisma, type PrismaClient } from '@prisma/client'
import type { DomainPost } from './fixtures.types'
import { mergedPostBody } from './mergePostBody'

export async function seedPosts(prisma: PrismaClient, posts: DomainPost[]): Promise<void> {
  for (const p of posts) {
    const content = mergedPostBody({
      content: p.content,
      title: p.title,
      description: p.description,
    })
    await prisma.post.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        authorId: p.authorId,
        type: p.type,
        content,
        createdAt: new Date(p.createdAt),
        visibility: p.visibility,
        category: p.category,
        location: p.location ? (p.location as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        tags: p.tags as unknown as Prisma.InputJsonValue,
        isTrending: p.isTrending,
        isHighestRated: p.isHighestRated,
      },
      update: {
        authorId: p.authorId,
        type: p.type,
        content,
        createdAt: new Date(p.createdAt),
        visibility: p.visibility,
        category: p.category,
        location: p.location ? (p.location as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        tags: p.tags as unknown as Prisma.InputJsonValue,
        isTrending: p.isTrending,
        isHighestRated: p.isHighestRated,
      },
    })
  }
}
