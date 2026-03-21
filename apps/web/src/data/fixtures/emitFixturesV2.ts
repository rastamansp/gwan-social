/**
 * One-shot: lê `gwan-social.fixtures.json` com schemaVersion 1 e reescreve como v2
 * (`domain` normalizado + sessão/UI). Executar: `npm run emit:fixtures --workspace=web`
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { legacyV1ToDomain } from './hydrateFixtures'
import type { LegacyGwanSocialFixtureV1 } from './hydrateFixtures'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const target = path.join(__dirname, 'gwan-social.fixtures.json')

const raw = JSON.parse(fs.readFileSync(target, 'utf8')) as { schemaVersion: number }

if (raw.schemaVersion >= 2) {
  console.info('[emitFixturesV2] Já é schemaVersion >= 2; nada a fazer.')
  process.exit(0)
}

const v1 = raw as LegacyGwanSocialFixtureV1
const domain = legacyV1ToDomain(v1)
const out = {
  schemaVersion: 2,
  domain,
  sessionDefaultUserId: v1.sessionDefaultUserId,
  sessionUserProfile: v1.sessionUserProfile,
  ui: v1.ui,
}

fs.writeFileSync(target, `${JSON.stringify(out, null, 2)}\n`)
console.info('[emitFixturesV2] Escrito', target)
