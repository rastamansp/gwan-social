import { Inject, Injectable } from '@nestjs/common'
import type { FixtureReadModelPort } from '../ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../ports/fixture-read-model.token'
import { publicUser } from '../mappers/profile.mappers'

export type PublicUserDto = NonNullable<ReturnType<typeof publicUser>>

@Injectable()
export class GetUserProfileUseCase {
  constructor(@Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort) {}

  execute(userId: string): PublicUserDto | null {
    return publicUser(this.fixtures.getHydrated(), userId)
  }
}
