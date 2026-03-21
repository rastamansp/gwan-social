import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { FixtureReadModelPort } from '../../application/ports/fixture-read-model.port'
import { resolveFixturesPath } from '../../config'
import type { HydratedFixtures } from './hydrateFixtures'
import { getHydrated, resetHydratedCache } from './loadHydrated'

@Injectable()
export class FixtureReadModelAdapter implements FixtureReadModelPort {
  private readonly fixturesPath: string

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    this.fixturesPath = resolveFixturesPath(process.cwd(), this.config.get<string>('FIXTURES_PATH'))
  }

  getFixturesFilePath(): string {
    return this.fixturesPath
  }

  getHydrated(): HydratedFixtures {
    return getHydrated(this.fixturesPath)
  }

  resetCache(): void {
    resetHydratedCache()
  }
}
