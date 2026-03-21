import type { HydratedFixtures } from '../../infrastructure/fixtures/hydrateFixtures'

export interface FixtureReadModelPort {
  getHydrated(): HydratedFixtures
  getFixturesFilePath(): string
  resetCache(): void
}
