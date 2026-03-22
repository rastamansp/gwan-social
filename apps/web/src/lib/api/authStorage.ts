const ACCESS_KEY = 'gwan-social-auth-access-v1'
const REFRESH_KEY = 'gwan-social-auth-refresh-v1'

export type AuthTokens = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(ACCESS_KEY)
    const t = raw?.trim()
    return t && t.length > 0 ? t : null
  } catch {
    return null
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

export function setAuthTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
  } catch {
    // quota
  }
  window.dispatchEvent(new Event('gwan-auth-changed'))
}

export function clearAuthTokens(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event('gwan-auth-changed'))
}
