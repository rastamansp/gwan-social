import { Inject, Injectable } from '@nestjs/common'
import type { SocialPost } from '../../types/socialPost.types'
import type { FixtureReadModelPort } from '../ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../ports/fixture-read-model.token'
import { postsByAuthorOrdered } from '../mappers/profile.mappers'
import { clampLimit, paginateByIndex, type PaginatedResult } from '../shared/pagination'

export interface ListUserPostsInput {
  userId: string
  limit?: string
  cursor?: string
}

@Injectable()
export class ListUserPostsUseCase {
  constructor(@Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort) {}

  execute(input: ListUserPostsInput): PaginatedResult<SocialPost> | null {
    const h = this.fixtures.getHydrated()
    if (!h.domain.users.some((u) => u.id === input.userId)) {
      return null
    }
    const lim = clampLimit(input.limit)
    const ordered = postsByAuthorOrdered(h.socialPosts, input.userId)
    return paginateByIndex(ordered, input.cursor, lim)
  }
}
