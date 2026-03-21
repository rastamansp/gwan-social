import { Inject, Injectable } from '@nestjs/common'
import type { SocialPost } from '../../types/socialPost.types'
import type { FixtureReadModelPort } from '../ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../ports/fixture-read-model.token'
import { clampLimit, paginateByIndex, type PaginatedResult } from '../shared/pagination'
import { type NearbyUi } from '../mappers/profile.mappers'

export interface ListNearbyPostsInput {
  limit?: string
  cursor?: string
}

export type NearbyPostRow = { post: SocialPost; distanceKm: number }

@Injectable()
export class ListNearbyPostsUseCase {
  constructor(@Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort) {}

  execute(input: ListNearbyPostsInput): PaginatedResult<NearbyPostRow> {
    const h = this.fixtures.getHydrated()
    const lim = clampLimit(input.limit)
    const ui = h.ui as NearbyUi
    const byId = new Map(h.socialPosts.map((p) => [p.id, p]))
    const combined = (ui.nearbyPostDistances ?? [])
      .map(({ postId, distanceKm }) => {
        const post = byId.get(postId)
        return post ? { post, distanceKm } : null
      })
      .filter((x): x is NearbyPostRow => x != null)
    return paginateByIndex(combined, input.cursor, lim)
  }
}
