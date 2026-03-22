import { Injectable } from '@nestjs/common'
import { clampLimit, paginateByIndex, type PaginatedResult } from '../shared/pagination'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

export interface ListUserFriendsInput {
  userId: string
  limit?: string
  cursor?: string
}

@Injectable()
export class ListUserFriendsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: ListUserFriendsInput): Promise<PaginatedResult<string> | null> {
    const lim = clampLimit(input.limit, 50, 100)

    const exists = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true },
    })
    if (!exists) return null

    const rows = await this.prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [{ userId: input.userId }, { friendUserId: input.userId }],
      },
    })

    const friendIds = new Set<string>()
    for (const r of rows) {
      if (r.userId === input.userId) friendIds.add(r.friendUserId)
      else friendIds.add(r.userId)
    }
    const ordered = [...friendIds].sort((a, b) => a.localeCompare(b))
    return paginateByIndex(ordered, input.cursor, lim)
  }
}
