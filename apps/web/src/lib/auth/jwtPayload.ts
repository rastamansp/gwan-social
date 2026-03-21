/**
 * Decodifica o payload de um JWT (sem validar assinatura).
 * Usado só para extrair `sub` / `username` enquanto `GET /me` carrega.
 */
export function decodeJwtPayload(token: string): { sub?: string; username?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(padded)
    const parsed = JSON.parse(json) as { sub?: unknown; username?: unknown }
    return {
      sub: typeof parsed.sub === 'string' ? parsed.sub : undefined,
      username: typeof parsed.username === 'string' ? parsed.username : undefined,
    }
  } catch {
    return null
  }
}
