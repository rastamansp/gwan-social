import { Inject, Injectable } from '@nestjs/common'
import type { FixtureReadModelPort } from '../ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../ports/fixture-read-model.token'
import { meUser } from '../mappers/profile.mappers'

export type SessionUserDto = NonNullable<ReturnType<typeof meUser>>

@Injectable()
export class GetSessionUserUseCase {
  constructor(@Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort) {}

  execute(): SessionUserDto | null {
    return meUser(this.fixtures.getHydrated())
  }
}
