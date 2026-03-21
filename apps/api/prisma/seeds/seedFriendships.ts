import type { PrismaClient } from '@prisma/client'
import type { DomainFriendship } from './fixtures.types'

export async function seedFriendships(
  prisma: PrismaClient,
  friendships: DomainFriendship[],
): Promise<void> {
  for (const f of friendships) {
    await prisma.friendship.upsert({
      where: {
        userId_friendUserId: {
          userId: f.userId,
          friendUserId: f.friendUserId,
        },
      },
      create: {
        userId: f.userId,
        friendUserId: f.friendUserId,
        status: f.status,
      },
      update: { status: f.status },
    })
  }
}
