import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { Link, type LinkProps } from 'react-router-dom'
import { useSessionUser } from '@/contexts/SessionUserContext'
import type { UserProfile } from '@/data/legacyFeed.types'
import { scoreToTier } from '@/data/socialPosts.adapters'
import { isApiEnabled } from '@/lib/api/config'
import { fetchUserProfile } from '@/lib/api/endpoints'
import { mapApiPublicUserToProfile } from '@/lib/api/mapApiUserToProfile'
import { userProfilePath } from '@/lib/routes'
import { cn } from '@/lib/utils'
import {
  fetchProfilePreviewDeduped,
  getProfilePreviewCached,
  setProfilePreviewCached,
} from './profilePreviewCache'
import { useTooltipAnchorPosition } from './useTooltipAnchorPosition'
import { UserTooltipCard, type UserTooltipCardState } from './UserTooltipCard'

const SHOW_DELAY_MS = 280
const HIDE_DELAY_MS = 120

export type UserProfileHint = {
  name?: string
  avatar?: string
  /** Pontuação social (0–5) quando conhecida sem perfil completo. */
  rating?: number
}

export type UserProfileHoverLinkProps = Omit<LinkProps, 'to'> & {
  userId: string
  to?: string
  /** Perfil já resolvido — não faz pedido à API. */
  cachedProfile?: UserProfile
  /** Dados mínimos para o cartão enquanto carrega (ex.: nome no comentário). */
  profileHint?: UserProfileHint
  /** Envolve o `Link` (ex.: `block w-full` numa linha de lista). */
  wrapperClassName?: string
}

function buildPartialProfile(userId: string, hint?: UserProfileHint): UserProfile | null {
  if (!hint?.name?.trim()) return null
  const rating = typeof hint.rating === 'number' && Number.isFinite(hint.rating) ? hint.rating : 0
  return {
    id: userId,
    name: hint.name.trim(),
    handle: '',
    avatar: hint.avatar ?? '',
    rating,
    ratingCount: 0,
    headline: '',
    bio: '',
    tier: scoreToTier(rating),
  }
}

export function UserProfileHoverLink({
  userId,
  to,
  cachedProfile,
  profileHint,
  wrapperClassName,
  className,
  children,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...linkRest
}: UserProfileHoverLinkProps) {
  const { resolveUser, registerApiUsers } = useSessionUser()
  const anchorRef = useRef<HTMLSpanElement>(null)
  /** IDs de timer no browser são `number` (evita `NodeJS.Timeout` do @types/node no `tsc -b`). */
  const showTimerRef = useRef<number | null>(null)
  const hideTimerRef = useRef<number | null>(null)
  const [open, setOpen] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [fetchedProfile, setFetchedProfile] = useState<UserProfile | null>(null)

  const { coords, updatePosition } = useTooltipAnchorPosition(anchorRef, {
    enabled: open,
  })

  useEffect(() => {
    setFetchedProfile(null)
    setFetchError(false)
  }, [userId])

  const tipId = useId()
  const href = to ?? userProfilePath(userId)

  const resolved = useMemo(() => {
    if (cachedProfile && cachedProfile.id === userId) return cachedProfile
    const r = resolveUser(userId)
    if (r && r.id === userId) return r
    return null
  }, [cachedProfile, resolveUser, userId])

  const cacheHit = getProfilePreviewCached(userId)
  const cacheProfile = cacheHit?.id === userId ? cacheHit : null

  const displayProfile =
    resolved ??
    cacheProfile ??
    (fetchedProfile?.id === userId ? fetchedProfile : null)

  const clearShowTimer = useCallback(() => {
    if (showTimerRef.current) {
      window.clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
  }, [])

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const scheduleOpen = useCallback(() => {
    clearHideTimer()
    clearShowTimer()
    showTimerRef.current = window.setTimeout(() => {
      showTimerRef.current = null
      setOpen(true)
      updatePosition()
    }, SHOW_DELAY_MS)
  }, [clearHideTimer, clearShowTimer, updatePosition])

  const scheduleClose = useCallback(() => {
    clearShowTimer()
    clearHideTimer()
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null
      setOpen(false)
    }, HIDE_DELAY_MS)
  }, [clearHideTimer, clearShowTimer])

  useEffect(() => {
    if (!open || !isApiEnabled()) return
    if (resolved) return
    if (getProfilePreviewCached(userId)?.id === userId) return

    let alive = true
    setFetchError(false)

    fetchProfilePreviewDeduped(userId, () =>
      fetchUserProfile(userId).then((dto) => mapApiPublicUserToProfile(dto)),
    )
      .then((p) => {
        if (!alive) return
        setProfilePreviewCached(userId, p)
        registerApiUsers([p])
        setFetchedProfile(p)
      })
      .catch(() => {
        if (!alive) return
        setFetchError(true)
      })

    return () => {
      alive = false
    }
  }, [open, resolved, userId, registerApiUsers])

  useEffect(() => {
    return () => {
      clearShowTimer()
      clearHideTimer()
    }
  }, [clearHideTimer, clearShowTimer])

  const tooltipState: UserTooltipCardState = useMemo(() => {
    if (fetchError && !displayProfile) {
      return { status: 'error' }
    }
    if (displayProfile) {
      return { status: 'ready', profile: displayProfile }
    }
    if (!isApiEnabled()) {
      const offlinePartial = buildPartialProfile(userId, profileHint)
      if (offlinePartial) {
        return { status: 'ready', profile: offlinePartial }
      }
      return { status: 'error', message: 'Sem ligação à API — não é possível pré-visualizar o perfil.' }
    }
    const partial = buildPartialProfile(userId, profileHint)
    if (partial) {
      return {
        status: 'loading',
        label: partial.name,
        avatarUrl: profileHint?.avatar,
        rating: profileHint?.rating,
      }
    }
    return { status: 'loading', label: 'A carregar…' }
  }, [displayProfile, fetchError, profileHint, userId])

  const linkNode = (
    <Link
      {...linkRest}
      to={href}
      className={className}
      aria-describedby={open ? tipId : undefined}
      onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => {
        onMouseEnter?.(e)
        scheduleOpen()
      }}
      onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => {
        onMouseLeave?.(e)
        scheduleClose()
      }}
      onFocus={(e: FocusEvent<HTMLAnchorElement>) => {
        onFocus?.(e)
        scheduleOpen()
      }}
      onBlur={(e: FocusEvent<HTMLAnchorElement>) => {
        onBlur?.(e)
        scheduleClose()
      }}
    >
      {children}
    </Link>
  )

  const portal =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            id={tipId}
            className="fixed max-w-[calc(100vw-1.5rem)] -translate-x-1/2"
            style={{ top: coords.top, left: coords.left }}
          >
            <UserTooltipCard state={tooltipState} />
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <span ref={anchorRef} className={cn(wrapperClassName)}>
        {linkNode}
      </span>
      {portal}
    </>
  )
}
