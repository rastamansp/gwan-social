import {
  BarChart3,
  Bell,
  LogOut,
  MapPin,
  Pencil,
  PlusSquare,
  Search,
  Star,
  User,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useSessionUser } from '@/contexts/SessionUserContext'
import { posts } from '@/data/mockUsers'
import {
  isCreatePostPathname,
  loginPath,
  userCreatePostPath,
  userProfileEditPath,
} from '@/lib/routes'
import { cn } from '@/lib/utils'

interface NavBarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

/** Sem aba “Feed”: o feed é o destino do logo Gwan (`/`). */
const tabs = [
  { id: 'profile', label: 'Meu perfil', icon: User },
  { id: 'pessoas', label: 'Pessoas', icon: Users },
  { id: 'ranking', label: 'Ranking', icon: BarChart3 },
]

const navScroll =
  '-mx-1 flex-nowrap overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

export function NavBar({ activeTab, onTabChange }: NavBarProps) {
  const { isAuthenticated, username: authUsername, logout } = useAuth()
  const { profile: sessionProfile, userId: sessionUserId, resolveUser } = useSessionUser()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userMenuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (userMenuRef.current?.contains(e.target as Node)) return
      setUserMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [userMenuOpen])

  useEffect(() => {
    if (!notificationsOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (notificationsRef.current?.contains(e.target as Node)) return
      setNotificationsOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNotificationsOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [notificationsOpen])

  const onIndex = pathname === '/' || pathname === '/home'
  const isNearby = pathname === '/nearby'
  const postRouteMatch = useMatch({ path: '/post/:postId', end: true })
  const postId = postRouteMatch?.params.postId
  const postForNav = postId ? posts.find((p) => p.id === postId) : undefined
  const postAuthor = postForNav ? resolveUser(postForNav.userId) : undefined

  const userRouteMatch = useMatch({ path: '/user/:userId', end: true })
  const routeUserId = userRouteMatch?.params.userId
  const routeProfileUser = routeUserId ? resolveUser(routeUserId) : undefined

  const isCreatePostFlow = isCreatePostPathname(pathname)

  const visibleTabs = useMemo(
    () =>
      isAuthenticated ? tabs : tabs.filter((t) => t.id !== 'profile'),
    [isAuthenticated],
  )

  const contextualSearchValue =
    isAuthenticated && onIndex && activeTab === 'profile'
      ? sessionProfile.name
      : isAuthenticated && isCreatePostFlow
        ? `Nova postagem · ${sessionProfile.name}`
        : postAuthor?.name ?? routeProfileUser?.name ?? ''

  const handleTabClick = (tabId: string) => {
    if (tabId === 'profile') {
      navigate(`/user/${sessionUserId}`)
      return
    }
    if (!onIndex) {
      navigate(`/?tab=${tabId}`)
    } else {
      onTabChange(tabId)
    }
  }

  const tabButtonClass = cn(
    'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2.5 font-display text-xs font-medium transition-all duration-200 active:scale-95 md:px-2.5 md:py-2 md:text-xs lg:px-3 lg:text-sm',
    'min-h-[48px] min-w-[48px] md:min-h-10 md:min-w-0',
  )

  const renderNavItems = () => (
    <>
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => handleTabClick(tab.id)}
          className={cn(
            tabButtonClass,
            onIndex && activeTab === tab.id
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          )}
        >
          <tab.icon size={20} className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
      {isAuthenticated ? (
        <Link
          to={userCreatePostPath(sessionUserId, 'content')}
          className={cn(
            tabButtonClass,
            isCreatePostFlow
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          )}
          aria-current={isCreatePostFlow ? 'page' : undefined}
        >
          <PlusSquare size={20} className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
          <span className="hidden sm:inline">Nova postagem</span>
        </Link>
      ) : null}
      {isAuthenticated ? (
        <Link
          to="/nearby"
          className={cn(
            tabButtonClass,
            isNearby
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          )}
        >
          <MapPin size={20} className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
          <span className="hidden sm:inline">Próximo</span>
        </Link>
      ) : null}
    </>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card/90 backdrop-blur-lg">
      <div className="mx-auto max-w-5xl px-2 sm:px-4">
        {/* Linha superior: marca, contexto (desktop), ações */}
        <div className="flex h-16 items-center justify-between gap-2 sm:h-[72px] sm:gap-2 md:h-16 md:gap-2 lg:h-[72px]">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-1.5 rounded-lg outline-none ring-primary/30 transition-opacity hover:opacity-90 focus-visible:ring-2 sm:gap-2"
            title="Ir para o feed"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 sm:h-9 sm:w-9">
              <Star className="h-5 w-5 fill-primary text-primary sm:h-4 sm:w-4" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight sm:text-xl">Gwan</span>
          </Link>

          {/* Navegação no meio — tablet/desktop, mesma linha que a pesquisa */}
          <nav
            className={cn(
              'hidden min-w-0 flex-1 items-center justify-center md:flex',
              navScroll,
            )}
            aria-label="Principal"
          >
            <div className="flex w-max max-w-full flex-nowrap items-center justify-center gap-1 px-1 md:gap-1.5 lg:gap-2">
              {renderNavItems()}
            </div>
          </nav>

          <div className="relative hidden w-[7.5rem] shrink-0 md:block lg:w-[9.5rem] xl:w-[11rem]">
            <Search
              className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground lg:left-2.5 lg:h-4 lg:w-4"
              aria-hidden
            />
            <label htmlFor="nav-context-search" className="sr-only">
              Contexto de navegação ou busca
            </label>
            <input
              id="nav-context-search"
              type="search"
              readOnly
              value={contextualSearchValue}
              placeholder="Contexto…"
              title={
                contextualSearchValue
                  ? `A ver contexto: ${contextualSearchValue}`
                  : 'Busca em breve'
              }
              className="w-full truncate rounded-full border border-border/60 bg-background/80 py-1.5 pl-7 pr-2 text-xs text-foreground shadow-sm outline-none ring-primary/20 placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 lg:py-2 lg:pl-8 lg:pr-2.5 lg:text-sm"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {isAuthenticated ? (
              <>
                <div className="relative shrink-0" ref={notificationsRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      setNotificationsOpen((o) => !o)
                    }}
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground outline-none ring-primary/30 transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:ring-2 active:scale-95 sm:h-10 sm:w-10"
                    aria-label="Notificações"
                    aria-expanded={notificationsOpen}
                    aria-haspopup="dialog"
                    aria-controls="nav-notifications-panel"
                  >
                    <Bell size={20} />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary sm:right-1 sm:top-1" />
                  </button>
                  {notificationsOpen ? (
                    <div
                      id="nav-notifications-panel"
                      role="region"
                      aria-label="Notificações"
                      className="fixed left-3 right-3 top-[5rem] z-[60] mt-0 rounded-xl border border-border/60 bg-card p-4 shadow-lg ring-1 ring-black/5 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-[min(100vw-2rem,18rem)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Bell size={18} className="text-primary" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-sm font-semibold text-foreground">Notificações</p>
                          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                            Em breve serão implementadas notificações — por exemplo alertas de interações,
                            convites e atualizações da tua rede.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="relative shrink-0" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false)
                      setUserMenuOpen((o) => !o)
                    }}
                    className="rounded-xl outline-none ring-primary/30 focus-visible:ring-2"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    aria-label="Menu da conta"
                  >
                    <img
                      src={sessionProfile.avatar}
                      alt=""
                      className="h-10 w-10 rounded-xl object-cover ring-2 ring-transparent transition hover:ring-primary/25 sm:h-8 sm:w-8"
                    />
                  </button>
                  {userMenuOpen ? (
                    <div
                      role="menu"
                      className="fixed left-3 right-3 top-[5rem] z-[60] mt-0 min-w-0 rounded-xl border border-border/60 bg-card py-1 shadow-lg ring-1 ring-black/5 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-1.5 sm:min-w-[11rem] sm:max-w-none"
                    >
                      <p className="truncate border-b border-border/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                        @{authUsername}
                      </p>
                      <Link
                        role="menuitem"
                        to={userProfileEditPath(sessionUserId)}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-2 px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-muted/60 sm:py-2.5"
                      >
                        <Pencil size={16} className="shrink-0 opacity-70" aria-hidden />
                        Editar perfil
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setUserMenuOpen(false)
                          logout()
                        }}
                        className="flex w-full items-center gap-2 border-t border-border/40 px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-muted/60 sm:py-2.5"
                      >
                        <LogOut size={16} className="shrink-0 opacity-70" aria-hidden />
                        Sair
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <Link
                to={loginPath()}
                className="shrink-0 rounded-full border border-border/60 bg-background px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50 sm:py-1.5 sm:text-sm"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>

        {/* Navegação — telemóvel (≥md os links vão na linha superior) */}
        <nav
          className={cn('border-t border-border/30 py-3 md:hidden', navScroll)}
          aria-label="Principal"
        >
          <div className="flex items-center gap-2 pr-2">{renderNavItems()}</div>
        </nav>
      </div>
    </header>
  )
}
