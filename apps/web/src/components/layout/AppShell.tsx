import { useMemo } from 'react'
import { Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { NavBar } from '@/components/social/NavBar'
import { useAuth } from '@/contexts/AuthContext'
import { useSessionUser } from '@/contexts/SessionUserContext'
import { parseMainNavTab } from '@/lib/main-nav'

/**
 * Shell da app social: barra de navegação partilhada + conteúdo (SPA).
 * Rotas de marketing (`/presentation`) ficam fora deste layout.
 */
export function AppShell() {
  const { isAuthenticated } = useAuth()
  const { userId: sessionUserId } = useSessionUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const { pathname } = useLocation()

  const activeTab = useMemo(() => {
    if (pathname === '/' || pathname === '/home') {
      const tab = parseMainNavTab(searchParams)
      if (tab === 'profile' && !isAuthenticated) return 'feed'
      return tab
    }
    const userMatch = /^\/user\/([^/]+)\/?$/.exec(pathname)
    const createOwn = /^\/user\/create-post(?:\/|$)/.test(pathname)
    const createLegacy = /^\/user\/([^/]+)\/create-post/.exec(pathname)
    const editMatch = /^\/user\/([^/]+)\/edit/.exec(pathname)
    if (
      isAuthenticated &&
      (userMatch?.[1] === sessionUserId ||
        createOwn ||
        createLegacy?.[1] === sessionUserId ||
        editMatch?.[1] === sessionUserId)
    ) {
      return 'profile'
    }
    return 'feed'
  }, [pathname, searchParams, sessionUserId, isAuthenticated])

  const setActiveTab = (tab: string) => {
    if (tab === 'feed') setSearchParams({}, { replace: true })
    else setSearchParams({ tab }, { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}
