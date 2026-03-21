import path from 'node:path'

/**
 * Mesma origem que o read model da API: `FIXTURES_PATH` ou o JSON em `apps/web`.
 * `__dirname` deve ser o de quem chama (ex.: `prisma/seeds` ao importar este módulo).
 */
export function resolveFixturesPath(fromDir: string): string {
  const env = process.env.FIXTURES_PATH?.trim()
  if (env) return path.resolve(env)
  return path.join(fromDir, '..', '..', '..', 'web', 'src', 'data', 'fixtures', 'gwan-social.fixtures.json')
}
