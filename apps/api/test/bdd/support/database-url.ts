/**
 * Evita que o Prisma fique bloqueado indefinidamente quando o host/porta não respondem
 * (comportamento por omissão do libpq sem connect_timeout).
 */
export function ensurePostgresConnectTimeout(seconds = 10): void {
  const u = process.env.DATABASE_URL
  if (!u || !u.startsWith('postgresql')) return
  if (/[?&]connect_timeout=/.test(u)) return
  const sep = u.includes('?') ? '&' : '?'
  process.env.DATABASE_URL = `${u}${sep}connect_timeout=${seconds}`
}
