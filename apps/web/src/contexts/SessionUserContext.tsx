import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { UserProfile } from '@/data/legacyFeed.types'
import { currentUser, users } from '@/data/mockUsers'
import { scoreToTier } from '@/data/socialPosts.adapters'
import { decodeJwtPayload } from '@/lib/auth/jwtPayload'
import { getAccessToken } from '@/lib/api/authStorage'
import { ApiHttpError } from '@/lib/api/client'
import { isApiEnabled } from '@/lib/api/config'
import { fetchMe } from '@/lib/api/endpoints'
import { mapApiMeUserToProfile } from '@/lib/api/mapApiUserToProfile'

const STORAGE_KEY = 'gwan-social-session-user-overrides-v2'

export type SessionUserOverrides = Partial<Pick<UserProfile, 'name' | 'handle' | 'bio' | 'avatar'>>

type SessionUserContextValue = {
  /** Utilizador “logado” (mock ou /me) com alterações guardadas localmente. */
  profile: UserProfile
  userId: string
  updateProfile: (patch: SessionUserOverrides) => void
  /** Remove overrides locais (ex.: após PATCH /me na API). */
  clearProfileOverrides: () => void
  resolveUser: (id: string) => UserProfile | undefined
  /** Regista perfis obtidos da API (ex.: visitantes de `/user/:id`, amigos). */
  registerApiUsers: (list: UserProfile[]) => void
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
    // quota excedida ou modo privado
  }
}

export function SessionUserProvider({ children }: { children: ReactNode }) {
  const mockBase = useMemo(
    () => users.find((u) => u.id === currentUser.id) ?? currentUser,
    [],
  )

  const [apiMeProfile, setApiMeProfile] = useState<UserProfile | null>(null)
  const [directory, setDirectory] = useState<Record<string, UserProfile>>({})
  /** Re-render quando o token em `localStorage` muda (sem `useAuth` — provider acima). */
  const [authTokenEpoch, setAuthTokenEpoch] = useState(0)

  useEffect(() => {
    const bump = () => setAuthTokenEpoch((n) => n + 1)
    window.addEventListener('gwan-auth-changed', bump)
    return () => window.removeEventListener('gwan-auth-changed', bump)
  }, [])

  useEffect(() => {
    if (!isApiEnabled()) return
    let cancelled = false

    const load = () => {
      if (!getAccessToken()) {
        setApiMeProfile(null)
        return
      }
      fetchMe()
        .then((me) => {
          if (cancelled) return
          const p = mapApiMeUserToProfile(me)
          setApiMeProfile(p)
          setDirectory((d) => ({ ...d, [p.id]: p }))
        })
        .catch((err: unknown) => {
          if (cancelled) return
          setApiMeProfile(null)
          if (err instanceof ApiHttpError && err.status === 401) {
            window.dispatchEvent(new Event('gwan-session-invalid'))
          }
        })
    }

    load()
    window.addEventListener('gwan-auth-changed', load)
    return () => {
      cancelled = true
      window.removeEventListener('gwan-auth-changed', load)
    }
  }, [])

  const baseProfile = useMemo((): UserProfile => {
    if (!isApiEnabled()) return mockBase
    const token = getAccessToken()
    if (!token) return mockBase
    if (apiMeProfile) return apiMeProfile
    const payload = decodeJwtPayload(token)
    if (payload?.sub && payload.username) {
      const rating = 0
      return {
        id: payload.sub,
        name: payload.username,
        handle: `@${payload.username}`,
        avatar: '',
        rating,
        ratingCount: 0,
        bio: '',
        tier: scoreToTier(rating),
      }
    }
    return mockBase
  }, [mockBase, apiMeProfile, authTokenEpoch])
  const userId = baseProfile.id

  const [overrides, setOverrides] = useState<SessionUserOverrides>(readStoredOverrides)

  const profile = useMemo((): UserProfile => {
    const merged = { ...baseProfile, ...overrides } as UserProfile
    if (
      isApiEnabled() &&
      overrides.bio === '' &&
      baseProfile.bio.trim().length > 0
    ) {
      merged.bio = baseProfile.bio
    }
    return merged
  }, [baseProfile, overrides])

  const updateProfile = useCallback((patch: SessionUserOverrides) => {
    setOverrides((prev) => {
      const next = { ...prev, ...patch }
      writeStoredOverrides(next)
      return next
    })
  }, [])

  const clearProfileOverrides = useCallback(() => {
    setOverrides({})
    writeStoredOverrides({})
  }, [])

  const registerApiUsers = useCallback((list: UserProfile[]) => {
    if (list.length === 0) return
    setDirectory((prev) => {
      const next = { ...prev }
      for (const u of list) {
        next[u.id] = u
      }
      return next
    })
  }, [])

  const resolveUser = useCallback(
    (id: string) => {
      if (id === userId) return profile
      return directory[id] ?? users.find((x) => x.id === id)
    },
    [profile, userId, directory],
  )

  const value = useMemo(
    () => ({
      profile,
      userId,
      updateProfile,
      clearProfileOverrides,
      resolveUser,
      registerApiUsers,
    }),
    [profile, userId, updateProfile, clearProfileOverrides, resolveUser, registerApiUsers],
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
