import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiHttpError } from '@/lib/api/client'
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '@/lib/api/authStorage'
import { isApiEnabled } from '@/lib/api/config'
import { fetchLogin, fetchLogout, fetchRegister } from '@/lib/api/endpoints'

const STORAGE_KEY = 'gwan-social-auth-v1'
const ACCOUNTS_KEY = 'gwan-social-local-accounts-v1'

/** Conta fixa para testes na demonstração (sem API). */
export const DEMO_TEST_USER = 'demo' as const
export const DEMO_TEST_PASSWORD = 'demo123' as const

export type AuthState = {
  isAuthenticated: boolean
  username: string | null
}

type LocalAccounts = Record<string, string>

function readStored(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { isAuthenticated: false, username: null }
    const j = JSON.parse(raw) as unknown
    if (j === null || typeof j !== 'object' || Array.isArray(j)) {
      return { isAuthenticated: false, username: null }
    }
    const rec = j as Record<string, unknown>
    const username =
      typeof rec.username === 'string'
        ? rec.username
        : typeof rec.email === 'string'
          ? (rec.email.split('@')[0] ?? rec.email)
          : null
    return {
      isAuthenticated: Boolean(rec.isAuthenticated),
      username,
    }
  } catch {
    return { isAuthenticated: false, username: null }
  }
}

function writeStored(next: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

function readAccounts(): LocalAccounts {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return {}
    const j = JSON.parse(raw) as unknown
    if (j === null || typeof j !== 'object' || Array.isArray(j)) return {}
    return j as LocalAccounts
  } catch {
    return {}
  }
}

function writeAccounts(accounts: LocalAccounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function normalizeLoginUsername(raw: string) {
  return raw.trim().toLowerCase()
}

function validateUsername(raw: string) {
  const u = normalizeLoginUsername(raw)
  if (u.length < 3) {
    throw new Error('Utilizador: mínimo 3 caracteres.')
  }
  if (!/^[a-z0-9_]+$/.test(u)) {
    throw new Error('Utilizador: só letras minúsculas, números e underscore (_).')
  }
  return u
}

function validatePasswordLogin(password: string) {
  if (password.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres.')
  }
}

function validatePasswordRegister(password: string, apiMode: boolean) {
  const min = apiMode ? 8 : 6
  if (password.length < min) {
    throw new Error(`A senha deve ter pelo menos ${min} caracteres.`)
  }
}

type AuthContextValue = AuthState & {
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  register: (name: string, username: string, password: string, email?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toUserMessage(err: unknown): string {
  if (err instanceof ApiHttpError) return err.message
  if (err instanceof Error) return err.message
  return 'Operação falhou.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(readStored)

  const login = useCallback(async (username: string, password: string) => {
    const u = validateUsername(username)
    validatePasswordLogin(password)

    if (isApiEnabled()) {
      try {
        const tokens = await fetchLogin({ username: u, password })
        setAuthTokens(tokens)
        const next: AuthState = { isAuthenticated: true, username: u }
        setState(next)
        writeStored(next)
        return
      } catch (err) {
        // Com API ativa, nunca fazer login “mock”: sem tokens o Bearer não é enviado (ex. DELETE /posts).
        throw new Error(toUserMessage(err))
      }
    }

    if (u === DEMO_TEST_USER && password === DEMO_TEST_PASSWORD) {
      const next: AuthState = { isAuthenticated: true, username: DEMO_TEST_USER }
      setState(next)
      writeStored(next)
      return
    }

    const accounts = readAccounts()
    if (accounts[u] === password) {
      const next: AuthState = { isAuthenticated: true, username: u }
      setState(next)
      writeStored(next)
      return
    }

    throw new Error(
      `Utilizador ou senha incorretos. Para testar, usa utilizador "${DEMO_TEST_USER}" e senha "${DEMO_TEST_PASSWORD}".`,
    )
  }, [])

  const logout = useCallback(() => {
    if (isApiEnabled()) {
      const refresh = getRefreshToken()
      if (refresh) {
        void fetchLogout(refresh).catch(() => {
          /* ignorar rede */
        })
      }
      clearAuthTokens()
    }
    const next: AuthState = { isAuthenticated: false, username: null }
    setState(next)
    writeStored(next)
  }, [])

  useEffect(() => {
    const onSessionInvalid = () => logout()
    window.addEventListener('gwan-session-invalid', onSessionInvalid)
    return () => window.removeEventListener('gwan-session-invalid', onSessionInvalid)
  }, [logout])

  /** Sessão antiga: flag autenticado sem access token (ex. login com fallback removido). Força novo login. */
  useEffect(() => {
    if (!isApiEnabled()) return
    const s = readStored()
    if (s.isAuthenticated && !getAccessToken()) {
      clearAuthTokens()
      const next: AuthState = { isAuthenticated: false, username: null }
      setState(next)
      writeStored(next)
    }
  }, [])

  useEffect(() => {
    const onProfileUpdated = (e: Event) => {
      const ce = e as CustomEvent<{ username?: string }>
      const u = ce.detail?.username
      if (typeof u !== 'string' || u.length < 1) return
      setState((prev) => {
        if (!prev.isAuthenticated) return prev
        const next: AuthState = { isAuthenticated: true, username: u }
        writeStored(next)
        return next
      })
    }
    window.addEventListener('gwan-profile-updated', onProfileUpdated)
    return () => window.removeEventListener('gwan-profile-updated', onProfileUpdated)
  }, [])

  const register = useCallback(async (name: string, username: string, password: string, emailRaw?: string) => {
    const n = name.trim()
    if (n.length < 2) {
      throw new Error('O nome deve ter pelo menos 2 caracteres.')
    }
    const u = validateUsername(username)
    const apiMode = isApiEnabled()
    validatePasswordRegister(password, apiMode)

    const emailTrim = emailRaw?.trim() ?? ''
    if (emailTrim && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      throw new Error('Indica um email válido ou deixa o campo em branco.')
    }

    if (u === DEMO_TEST_USER) {
      throw new Error(`O utilizador "${DEMO_TEST_USER}" é reservado para a conta de teste. Escolhe outro.`)
    }

    if (apiMode) {
      try {
        const tokens = await fetchRegister({
          displayName: n,
          username: u,
          password,
          ...(emailTrim ? { email: emailTrim.toLowerCase() } : {}),
        })
        setAuthTokens(tokens)
        const next: AuthState = { isAuthenticated: true, username: u }
        setState(next)
        writeStored(next)
        return
      } catch (err) {
        throw new Error(toUserMessage(err))
      }
    }

    const accounts = readAccounts()
    if (accounts[u] !== undefined) {
      throw new Error('Este nome de utilizador já está registado.')
    }

    accounts[u] = password
    writeAccounts(accounts)
    const next: AuthState = { isAuthenticated: true, username: u }
    setState(next)
    writeStored(next)
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      register,
    }),
    [state, login, logout, register],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return ctx
}
