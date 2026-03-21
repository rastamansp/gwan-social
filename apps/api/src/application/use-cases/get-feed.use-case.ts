import { Inject, Injectable } from '@nestjs/common'
import type { SocialPost } from '../../types/socialPost.types'
import type { FixtureReadModelPort } from '../ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../ports/fixture-read-model.token'
import { clampLimit, paginateByIndex, type PaginatedResult } from '../shared/pagination'
import { orderPostsForFeed } from '../../infrastructure/fixtures/feedOrder'

export interface GetFeedInput {
  limit?: string
  cursor?: string
}

@Injectable()
export class GetFeedUseCase {
  constructor(@Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort) {}

  execute(input: GetFeedInput): PaginatedResult<SocialPost> {
    const h = this.fixtures.getHydrated()
    const lim = clampLimit(input.limit)
    const ordered = orderPostsForFeed(h.socialPosts)
    return paginateByIndex(ordered, input.cursor, lim)
  }
}
