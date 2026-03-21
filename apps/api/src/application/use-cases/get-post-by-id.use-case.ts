import { Inject, Injectable } from '@nestjs/common'
import type { SocialPost } from '../../types/socialPost.types'
import type { FixtureReadModelPort } from '../ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../ports/fixture-read-model.token'

@Injectable()
export class GetPostByIdUseCase {
  constructor(@Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort) {}

  execute(postId: string): SocialPost | null {
    const h = this.fixtures.getHydrated()
    return h.socialPosts.find((p) => p.id === postId) ?? null
  }
}
