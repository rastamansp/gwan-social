import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { FixturesFile } from './fixtures.types'
import { resolveFixturesPath } from './resolveFixturesPath'

export function loadFixtures(): FixturesFile {
  const filePath = resolveFixturesPath(path.join(__dirname))
  const raw = readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as FixturesFile
}
