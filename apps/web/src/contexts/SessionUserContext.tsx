import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { UserProfile } from '@/data/legacyFeed.types'
import { currentUser, users } from '@/data/mockUsers'

const STORAGE_KEY = 'gwan-social-session-user-overrides-v2'

export type SessionUserOverrides = Partial<Pick<UserProfile, 'name' | 'handle' | 'bio' | 'avatar'>>

type SessionUserContextValue = {
  /** Utilizador “logado” (mock) com alterações guardadas localmente. */
  profile: UserProfile
  userId: string
  updateProfile: (patch: SessionUserOverrides) => void
  /** Resolve perfil para exibição (substitui o mock do utilizador atual pelo `profile` da sessão). */
  resolveUser: (id: string) => UserProfile | undefined
}

const SessionUserContext = createContext<SessionUserContextValue | null>(null)

function readStoredOverrides(): SessionUserOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as SessionUserOverrides
  } catch {
    return {}
  }
}

function writeStoredOverrides(next: SessionUserOverrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // quota excedida ou modo privado — estado em memória mantém-se na sessão
  }
}

export function SessionUserProvider({ children }: { children: ReactNode }) {
  const base = useMemo(
    () => users.find((u) => u.id === currentUser.id) ?? currentUser,
    [],
  )

  const [overrides, setOverrides] = useState<SessionUserOverrides>(readStoredOverrides)

  const profile = useMemo(
    () => ({ ...base, ...overrides }) as UserProfile,
    [base, overrides],
  )

  const updateProfile = useCallback((patch: SessionUserOverrides) => {
    setOverrides((prev) => {
      const next = { ...prev, ...patch }
      writeStoredOverrides(next)
      return next
    })
  }, [])

  const resolveUser = useCallback(
    (id: string) => {
      const u = users.find((x) => x.id === id)
      if (!u) return undefined
      if (id === currentUser.id) return profile
      return u
    },
    [profile],
  )

  const value = useMemo(
    () => ({
      profile,
      userId: currentUser.id,
      updateProfile,
      resolveUser,
    }),
    [profile, updateProfile, resolveUser],
  )

  return <SessionUserContext.Provider value={value}>{children}</SessionUserContext.Provider>
}

export function useSessionUser(): SessionUserContextValue {
  const ctx = useContext(SessionUserContext)
  if (!ctx) {
    throw new Error('useSessionUser deve ser usado dentro de SessionUserProvider')
  }
  return ctx
}
