import type { AuthTokens } from '@/lib/api/authStorage'

/** Normaliza a resposta de login / registo / refresh (camelCase ou snake_case). */
export function parseAuthTokensResponse(raw: unknown): AuthTokens {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Resposta de autenticação inválida.')
  }
  const r = raw as Record<string, unknown>
  const access = r.accessToken ?? r.access_token
  const refresh = r.refreshToken ?? r.refresh_token
  const expiresRaw = r.expiresIn ?? r.expires_in
  const typeRaw = r.tokenType ?? r.token_type
  if (typeof access !== 'string' || typeof refresh !== 'string') {
    throw new Error('Resposta de autenticação inválida.')
  }
  const expiresIn = typeof expiresRaw === 'number' ? expiresRaw : Number(expiresRaw)
  const tokenType: AuthTokens['tokenType'] = typeRaw === 'Bearer' ? 'Bearer' : 'Bearer'
  return {
    accessToken: access,
    refreshToken: refresh,
    expiresIn: Number.isFinite(expiresIn) ? expiresIn : 0,
    tokenType,
  }
}
