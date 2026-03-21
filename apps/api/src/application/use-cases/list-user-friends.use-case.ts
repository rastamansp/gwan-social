import { Inject, Injectable } from '@nestjs/common'
import { getFriendUserIdsFor } from '../../infrastructure/fixtures/hydrateFixtures'
import type { FixtureReadModelPort } from '../ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../ports/fixture-read-model.token'
import { clampLimit, paginateByIndex, type PaginatedResult } from '../shared/pagination'

export interface ListUserFriendsInput {
  userId: string
  limit?: string
  cursor?: string
}

@Injectable()
export class ListUserFriendsUseCase {
  constructor(@Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort) {}

  execute(input: ListUserFriendsInput): PaginatedResult<string> | null {
    const h = this.fixtures.getHydrated()
    if (!h.domain.users.some((u) => u.id === input.userId)) {
      return null
    }
    const lim = clampLimit(input.limit, 50, 100)
    const ids = getFriendUserIdsFor(h.domain, input.userId)
    return paginateByIndex(ids, input.cursor, lim)
  }
}
