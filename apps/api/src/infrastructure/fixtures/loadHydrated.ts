import fs from 'node:fs'
import { hydrateRawFixture, type HydratedFixtures, type RawGwanFixture } from './hydrateFixtures'

let cache: HydratedFixtures | null = null

export function loadHydratedFromPath(fixturesPath: string): HydratedFixtures {
  const raw = JSON.parse(fs.readFileSync(fixturesPath, 'utf8')) as RawGwanFixture
  return hydrateRawFixture(raw)
}

export function getHydrated(fixturesPath: string): HydratedFixtures {
  if (!cache) {
    cache = loadHydratedFromPath(fixturesPath)
  }
  return cache
}

export function resetHydratedCache(): void {
  cache = null
}
