import { Inject, Injectable } from '@nestjs/common'
import type { ProfileRatedEntry } from '../../types/fixture-types'
import { getProfileRatedEntriesForReviewee } from '../../infrastructure/fixtures/hydrateFixtures'
import type { FixtureReadModelPort } from '../ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../ports/fixture-read-model.token'
import { clampLimit, paginateByIndex, type PaginatedResult } from '../shared/pagination'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

export interface ListUserRatingsReceivedInput {
  userId: string
  limit?: string
  cursor?: string
}

@Injectable()
export class ListUserRatingsReceivedUseCase {
  constructor(
    @Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: ListUserRatingsReceivedInput): Promise<PaginatedResult<ProfileRatedEntry> | null> {
    const h = this.fixtures.getHydrated()
    const lim = clampLimit(input.limit)

    if (h.domain.users.some((u) => u.id === input.userId)) {
      const all = getProfileRatedEntriesForReviewee(h.domain, input.userId)
      return paginateByIndex(all, input.cursor, lim)
    }

    const exists = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true },
    })
    if (!exists) return null

    return paginateByIndex([], input.cursor, lim)
  }
}
