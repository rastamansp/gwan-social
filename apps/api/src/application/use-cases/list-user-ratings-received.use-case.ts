import { Inject, Injectable } from '@nestjs/common'
import type { ProfileRatedEntry } from '../../types/fixture-types'
import { getProfileRatedEntriesForReviewee } from '../../infrastructure/fixtures/hydrateFixtures'
import type { FixtureReadModelPort } from '../ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../ports/fixture-read-model.token'
import { clampLimit, paginateByIndex, type PaginatedResult } from '../shared/pagination'

export interface ListUserRatingsReceivedInput {
  userId: string
  limit?: string
  cursor?: string
}

@Injectable()
export class ListUserRatingsReceivedUseCase {
  constructor(@Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort) {}

  execute(input: ListUserRatingsReceivedInput): PaginatedResult<ProfileRatedEntry> | null {
    const h = this.fixtures.getHydrated()
    if (!h.domain.users.some((u) => u.id === input.userId)) {
      return null
    }
    const lim = clampLimit(input.limit)
    const all = getProfileRatedEntriesForReviewee(h.domain, input.userId)
    return paginateByIndex(all, input.cursor, lim)
  }
}
