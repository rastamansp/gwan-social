/**
 * URL base da API até `/api/v1` (ex.: `http://localhost:4000/api/v1`).
 * Vazio → modo mock (sem pedidos HTTP).
 */
export function getApiBaseUrl(): string | null {
  const raw = import.meta.env.VITE_API_URL?.trim()
  if (!raw) return null
  return raw.replace(/\/+$/, '')
}

export function isApiEnabled(): boolean {
  return getApiBaseUrl() != null
}
