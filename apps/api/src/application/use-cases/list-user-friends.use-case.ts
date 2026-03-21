import { Inject, Injectable } from '@nestjs/common'
import { getFriendUserIdsFor } from '../../infrastructure/fixtures/hydrateFixtures'
import type { FixtureReadModelPort } from '../ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../ports/fixture-read-model.token'
import { clampLimit, paginateByIndex, type PaginatedResult } from '../shared/pagination'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

export interface ListUserFriendsInput {
  userId: string
  limit?: string
  cursor?: string
}

@Injectable()
export class ListUserFriendsUseCase {
  constructor(
    @Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: ListUserFriendsInput): Promise<PaginatedResult<string> | null> {
    const h = this.fixtures.getHydrated()
    const lim = clampLimit(input.limit, 50, 100)

    if (h.domain.users.some((u) => u.id === input.userId)) {
      const ids = getFriendUserIdsFor(h.domain, input.userId)
      return paginateByIndex(ids, input.cursor, lim)
    }

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
