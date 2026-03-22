export function parsePort(portEnv?: string): number {
  const p = Number.parseInt(portEnv ?? '4000', 10)
  return Number.isFinite(p) && p > 0 ? p : 4000
}

/** Origens CORS (vírgula). */
export function parseCorsOrigins(raw?: string): string[] {
  const t = raw?.trim()
  if (t) {
    return t
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return ['http://localhost:5173', 'http://127.0.0.1:5173']
}

export function publicApiBase(port: number, publicUrl?: string): string {
  const u = publicUrl?.trim().replace(/\/$/, '')
  return u || `http://localhost:${port}`
}

/** Segundos para expiração JWT (env opcional); evita NaN no jsonwebtoken. */
export function parseJwtExpiresSec(raw: string | undefined, fallback: number): number {
  const n = Number.parseInt(raw ?? String(fallback), 10)
  return Number.isFinite(n) && n >= 1 ? n : fallback
}
