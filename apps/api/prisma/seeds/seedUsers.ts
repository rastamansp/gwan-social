import type { PrismaClient } from '@prisma/client'
import type { DomainUser } from './fixtures.types'

export async function seedUsers(prisma: PrismaClient, users: DomainUser[]): Promise<void> {
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      create: {
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl ?? null,
        headline: u.headline ?? null,
      },
      update: {
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl ?? null,
        headline: u.headline ?? null,
      },
    })
  }
}
