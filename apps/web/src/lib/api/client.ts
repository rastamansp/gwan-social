import { getAccessToken } from '@/lib/api/authStorage'
import { getApiBaseUrl } from '@/lib/api/config'

export class ApiHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiHttpError'
  }
}

const DEFAULT_TIMEOUT_MS = 25_000

function joinBaseAndPath(base: string, path: string): string {
  const p = path.startsWith('/') ? path.slice(1) : path
  return `${base}/${p}`
}

function parseErrorMessage(status: number, text: string): string {
  try {
    const j = JSON.parse(text) as { message?: unknown; error?: unknown }
    if (Array.isArray(j.message)) {
      return j.message.map(String).join('; ')
    }
    if (typeof j.message === 'string') return j.message
    if (typeof j.error === 'string') return j.error
  } catch {
    // ignore
  }
  return text || statusTextFallback(status)
}

function statusTextFallback(status: number): string {
  if (status === 401) return 'Não autorizado'
  if (status === 422) return 'Dados inválidos'
  if (status === 503) return 'Serviço indisponível'
  return `Erro HTTP ${status}`
}

function wrapFetchError(err: unknown): never {
  if (err instanceof ApiHttpError) throw err
  if (err instanceof Error && err.name === 'AbortError') {
    throw new ApiHttpError(0, 'Pedido expirou ou foi cancelado.')
  }
  if (err instanceof TypeError && typeof err.message === 'string') {
    throw new ApiHttpError(0, 'Sem ligação ao servidor. Confirma que a API está a correr e a URL em VITE_API_URL.')
  }
  throw err
}

function authHeaders(skipAuth?: boolean): HeadersInit {
  if (skipAuth) return {}
  const t = getAccessToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export async function apiGet<T>(
  path: string,
  options?: {
    query?: Record<string, string | number | undefined | null>
    timeoutMs?: number
    skipAuth?: boolean
  },
): Promise<T> {
  const base = getApiBaseUrl()
  if (!base) {
    throw new Error('VITE_API_URL não definida')
  }

  const url = new URL(joinBaseAndPath(base, path))
  if (options?.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v === undefined || v === null || v === '') continue
      url.searchParams.set(k, String(v))
    }
  }

  const ctrl = new AbortController()
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const timeout =
    timeoutMs > 0
      ? window.setTimeout(() => ctrl.abort(), timeoutMs)
      : 0

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
      signal: ctrl.signal,
      headers: {
        ...authHeaders(options?.skipAuth),
      },
    })
    if (!res.ok) {
      const text = await res.text()
      throw new ApiHttpError(res.status, parseErrorMessage(res.status, text))
    }
    return (await res.json()) as T
  } catch (err) {
    return wrapFetchError(err)
  } finally {
    if (timeout) window.clearTimeout(timeout)
  }
}

export async function apiDelete(
  path: string,
  options?: {
    timeoutMs?: number
    skipAuth?: boolean
  },
): Promise<void> {
  const base = getApiBaseUrl()
  if (!base) {
    throw new Error('VITE_API_URL não definida')
  }

  const url = joinBaseAndPath(base, path)
  const ctrl = new AbortController()
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const timeout =
    timeoutMs > 0
      ? window.setTimeout(() => ctrl.abort(), timeoutMs)
      : 0

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      signal: ctrl.signal,
      headers: {
        ...authHeaders(options?.skipAuth),
      },
    })
    if (res.status === 204) {
      return
    }
    const text = await res.text()
    if (!res.ok) {
      throw new ApiHttpError(res.status, parseErrorMessage(res.status, text))
    }
  } catch (err) {
    return wrapFetchError(err)
  } finally {
    if (timeout) window.clearTimeout(timeout)
  }
}

/** DELETE com resposta JSON (ex.: post atualizado após apagar comentário). */
export async function apiDeleteJson<T>(
  path: string,
  options?: {
    timeoutMs?: number
    skipAuth?: boolean
  },
): Promise<T> {
  const base = getApiBaseUrl()
  if (!base) {
    throw new Error('VITE_API_URL não definida')
  }

  const url = joinBaseAndPath(base, path)
  const ctrl = new AbortController()
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const timeout =
    timeoutMs > 0
      ? window.setTimeout(() => ctrl.abort(), timeoutMs)
      : 0

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      signal: ctrl.signal,
      headers: {
        ...authHeaders(options?.skipAuth),
      },
    })
    const text = await res.text()
    if (!res.ok) {
      throw new ApiHttpError(res.status, parseErrorMessage(res.status, text))
    }
    return text ? (JSON.parse(text) as T) : ({} as T)
  } catch (err) {
    return wrapFetchError(err)
  } finally {
    if (timeout) window.clearTimeout(timeout)
  }
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  options?: {
    timeoutMs?: number
    skipAuth?: boolean
  },
): Promise<T> {
  const base = getApiBaseUrl()
  if (!base) {
    throw new Error('VITE_API_URL não definida')
  }

  const url = joinBaseAndPath(base, path)
  const ctrl = new AbortController()
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const timeout =
    timeoutMs > 0
      ? window.setTimeout(() => ctrl.abort(), timeoutMs)
      : 0

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(options?.skipAuth),
      },
      body: JSON.stringify(body),
    })
    if (res.status === 204) {
      return undefined as T
    }
    const text = await res.text()
    if (!res.ok) {
      throw new ApiHttpError(res.status, parseErrorMessage(res.status, text))
    }
    if (!text) {
      return undefined as T
    }
    return JSON.parse(text) as T
  } catch (err) {
    return wrapFetchError(err)
  } finally {
    if (timeout) window.clearTimeout(timeout)
  }
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  options?: {
    timeoutMs?: number
    skipAuth?: boolean
  },
): Promise<T> {
  const base = getApiBaseUrl()
  if (!base) {
    throw new Error('VITE_API_URL não definida')
  }

  const url = joinBaseAndPath(base, path)
  const ctrl = new AbortController()
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const timeout =
    timeoutMs > 0
      ? window.setTimeout(() => ctrl.abort(), timeoutMs)
      : 0

  try {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(options?.skipAuth),
      },
      body: JSON.stringify(body),
    })
    if (res.status === 204) {
      return undefined as T
    }
    const text = await res.text()
    if (!res.ok) {
      throw new ApiHttpError(res.status, parseErrorMessage(res.status, text))
    }
    if (!text) {
      return undefined as T
    }
    return JSON.parse(text) as T
  } catch (err) {
    return wrapFetchError(err)
  } finally {
    if (timeout) window.clearTimeout(timeout)
  }
}

/** POST multipart (ex.: upload de avatar). Não definir Content-Type — o browser define o boundary. */
export async function apiPostMultipart<T>(
  path: string,
  formData: FormData,
  options?: {
    timeoutMs?: number
    skipAuth?: boolean
  },
): Promise<T> {
  const base = getApiBaseUrl()
  if (!base) {
    throw new Error('VITE_API_URL não definida')
  }

  const url = joinBaseAndPath(base, path)
  const ctrl = new AbortController()
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const timeout =
    timeoutMs > 0
      ? window.setTimeout(() => ctrl.abort(), timeoutMs)
      : 0

  try {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      signal: ctrl.signal,
      headers: {
        ...authHeaders(options?.skipAuth),
      },
      body: formData,
    })
    if (res.status === 204) {
      return undefined as T
    }
    const text = await res.text()
    if (!res.ok) {
      throw new ApiHttpError(res.status, parseErrorMessage(res.status, text))
    }
    if (!text) {
      return undefined as T
    }
    return JSON.parse(text) as T
  } catch (err) {
    return wrapFetchError(err)
  } finally {
    if (timeout) window.clearTimeout(timeout)
  }
}
