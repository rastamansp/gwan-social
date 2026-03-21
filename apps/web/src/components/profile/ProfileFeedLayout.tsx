import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ProfileMomentCard } from '@/components/profile/ProfileMomentCard'
import { ProfileFeedSidebar } from '@/components/profile/ProfileFeedSidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useSessionUser } from '@/contexts/SessionUserContext'
import type { UserProfile } from '@/data/mockUsers'
import {
  buildProfileFriendsList,
  featuredMomentRating,
  getProfileDashboardStatsForUser,
  getProfilePostsForUser,
  getTierColor,
  getTierLabel,
  profileRatedEntries,
  users,
} from '@/data/mockUsers'
import { formatRelativeTime } from '@/data/socialPosts.adapters'
import { loginPath, userCreatePostPath, userProfileEditPath } from '@/lib/routes'
import { cn } from '@/lib/utils'

type ProfileSection = 'moments' | 'photos' | 'rated' | 'friends'

const SECTIONS: { id: ProfileSection; label: string }[] = [
  { id: 'moments', label: 'Momentos' },
  { id: 'photos', label: 'Fotos' },
  { id: 'rated', label: 'Avaliados' },
  { id: 'friends', label: 'Amigos' },
]

function tierBadgeLabel(tier: UserProfile['tier']) {
  switch (tier) {
    case 'elite':
      return 'Prime User'
    case 'premium':
      return 'Premium'
    case 'standard':
      return 'Standard'
    case 'low':
      return 'Basic'
    default:
      return 'Member'
  }
}

function splitDisplayName(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return { first: name, last: '' }
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] ?? '' }
}

interface ProfileFeedLayoutProps {
  /** Sem valor = perfil do utilizador da sessão, ex. `/?tab=profile`. */
  profileUserId?: string
}

export function ProfileFeedLayout({ profileUserId }: ProfileFeedLayoutProps) {
  const { isAuthenticated } = useAuth()
  const { userId: sessionUserId, resolveUser } = useSessionUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [section, setSection] = useState<ProfileSection>('moments')
  const resolvedUserId = profileUserId ?? sessionUserId
  const profileUser = resolveUser(resolvedUserId)
  const isOwnProfile = resolvedUserId === sessionUserId
  const canManageProfile = isOwnProfile && isAuthenticated

  const dashboardStats = useMemo(
    () => getProfileDashboardStatsForUser(resolvedUserId),
    [resolvedUserId],
  )
  const userPosts = useMemo(() => getProfilePostsForUser(resolvedUserId), [resolvedUserId])

  const profileFriends = useMemo(
    () => buildProfileFriendsList(users, resolvedUserId),
    [resolvedUserId],
  )

  if (!profileUser) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-12 text-center sm:px-4 sm:py-16 md:px-8">
        <p className="font-display text-lg text-neutral-600">Perfil não encontrado.</p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Voltar ao feed
        </Link>
      </div>
    )
  }

  const { first, last } = splitDisplayName(profileUser.name)
  const createPostDemoDone = Boolean(
    canManageProfile &&
      (location.state as { createPostDemoDone?: boolean } | null)?.createPostDemoDone,
  )

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <main className="lg:col-span-8">
          <div
            className={cn(
              'overflow-hidden rounded-[28px] bg-white text-neutral-700 shadow-sm ring-1 ring-black/5',
              canManageProfile && 'ring-2 ring-primary/25',
            )}
          >
            {/* Cabeçalho perfil */}
            <div className="border-b border-neutral-200 px-6 py-6 md:px-8">
              {createPostDemoDone ? (
                <p
                  className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-200/80"
                  role="status"
                >
                  Publicação simulada concluída. O feed mock não foi alterado — em produção isto criaria
                  um post.
                </p>
              ) : null}
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <img
                    src={profileUser.avatar}
                    alt=""
                    className={cn(
                      'h-20 w-20 shrink-0 rounded-full object-cover ring-2',
                      canManageProfile ? 'ring-primary/35' : 'ring-neutral-200',
                    )}
                  />
                  <div>
                    <div className="flex flex-col gap-1.5">
                      {canManageProfile ? (
                        <span className="inline-flex w-fit items-center rounded-full bg-primary/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                          O teu perfil
                        </span>
                      ) : isOwnProfile ? (
                        <Link
                          to={loginPath()}
                          className="inline-flex w-fit items-center rounded-full bg-stone-200/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-700 transition hover:bg-stone-300/90"
                        >
                          Inicia sessão para gerir
                        </Link>
                      ) : (
                        <span className="inline-flex w-fit items-center rounded-full bg-stone-200/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600">
                          Perfil de outro utilizador
                        </span>
                      )}
                      <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">
                        {canManageProfile
                          ? 'Geres o que partilhas'
                          : isOwnProfile
                            ? 'Entra para editar e criar postagens'
                            : 'Só visualização'}
                      </p>
                    </div>
                    <h1 className="mt-2 font-display text-3xl font-light leading-tight text-neutral-900 md:text-5xl">
                      {last ? (
                        <>
                          {first} <br className="hidden md:block" />
                          {last}
                        </>
                      ) : (
                        first
                      )}
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="font-display text-4xl font-light tabular-nums text-neutral-900 md:text-6xl">
                        {profileUser.rating.toFixed(3)}
                      </span>
                      <span className="rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                        {tierBadgeLabel(profileUser.tier)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm md:min-w-[220px]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Fotos</p>
                    <p className="mt-2 text-xl font-light text-neutral-900">{dashboardStats.photos}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Avaliados</p>
                    <p className="mt-2 text-xl font-light text-neutral-900">{dashboardStats.rated}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Amigos</p>
                    <p className="mt-2 text-xl font-light text-neutral-900">
                      {dashboardStats.friendsLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Estado</p>
                    <p className="mt-2 text-xl font-light text-emerald-600">Online</p>
                  </div>
                </div>
              </div>

              {canManageProfile ? (
                <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-white to-white p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                      Nova postagem
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                      Fluxo em <strong>três páginas</strong>: texto, mídia e revisão antes de publicar
                      (demonstração local).
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Link
                      to={userProfileEditPath(sessionUserId)}
                      className="inline-flex shrink-0 items-center justify-center rounded-full border border-primary/35 bg-white px-5 py-2.5 text-center text-sm font-medium text-primary shadow-sm transition hover:bg-primary/5 active:scale-[0.98]"
                    >
                      Editar perfil
                    </Link>
                    <Link
                      to={userCreatePostPath(sessionUserId, 'content')}
                      className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-center text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98]"
                    >
                      Criar postagem
                    </Link>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-6 border-t border-neutral-200 pt-4 text-sm uppercase tracking-[0.25em] text-neutral-400">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSection(s.id)}
                    className={cn(
                      'transition-colors',
                      section === s.id ? 'text-neutral-900' : 'hover:text-neutral-900',
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {section === 'moments' && (
              <>
                {userPosts.length === 0 ? (
                  <div className="border-t border-neutral-200 px-6 py-14 text-center text-sm text-neutral-500 md:px-8">
                    Nenhum momento publicado neste perfil no mock.
                  </div>
                ) : (
                  <section className="border-t border-neutral-200 px-6 py-6 md:px-8">
                    <div className="mb-6">
                      <div className="max-w-xl">
                        {canManageProfile ? (
                          <div className="rounded-[24px] bg-stone-50 p-5 ring-1 ring-black/5">
                            <div className="flex items-center gap-3">
                              <img
                                src={profileUser.avatar}
                                alt=""
                                className="h-12 w-12 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                                  {featuredMomentRating.extraRatingsLabel}
                                </p>
                                <h3 className="text-lg font-medium text-neutral-900">{profileUser.name}</h3>
                              </div>
                            </div>
                            <div className="mt-4 flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={cn(
                                    'text-2xl leading-none',
                                    star <= featuredMomentRating.filledStars
                                      ? 'text-fuchsia-500'
                                      : 'text-neutral-300',
                                  )}
                                  aria-hidden
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <p className="mt-4 text-sm leading-6 text-neutral-600">
                              {featuredMomentRating.quote}
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-[24px] bg-stone-50 p-5 ring-1 ring-black/5">
                            <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Sobre</p>
                            <p className="mt-3 text-sm leading-6 text-neutral-700">{profileUser.bio}</p>
                            <p className="mt-4 text-xs text-neutral-400">{profileUser.handle}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-6">
                      <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                        Momentos · {userPosts.length}{' '}
                        {userPosts.length === 1 ? 'publicação' : 'publicações'}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Vista de perfil: miniaturas, título, local, etiquetas e métricas — diferente do feed
                        principal.
                      </p>
                      <div className="mt-5 space-y-5">
                        {userPosts.map((post, i) => (
                          <ProfileMomentCard key={post.id} post={post} animationDelay={i * 60} />
                        ))}
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}

            {section === 'photos' && (
              <div className="px-6 py-8 md:px-8">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {userPosts
                    .filter((p): p is typeof p & { image: string } => Boolean(p.image))
                    .map((p) => (
                      <div
                        key={p.id}
                        className="aspect-square overflow-hidden rounded-2xl bg-stone-100 ring-1 ring-black/5"
                      >
                        <img src={p.image} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {section === 'rated' && (
              <div className="border-t border-neutral-200 px-6 py-6 md:px-8">
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                  Avaliações recebidas
                </p>
                {canManageProfile ? (
                  <>
                    <p className="mt-2 text-sm text-neutral-600">
                      Notas e comentários sobre os teus momentos ou sobre o teu perfil (mock).
                    </p>
                    <ul className="mt-6 space-y-4">
                      {profileRatedEntries.map((entry) => {
                        const reviewer = users.find((u) => u.id === entry.reviewerId)
                        if (!reviewer) return null
                        return (
                          <li
                            key={entry.id}
                            className="flex gap-4 rounded-2xl bg-stone-50 p-4 ring-1 ring-black/5"
                          >
                            <Link to={`/user/${reviewer.id}`} className="shrink-0">
                              <img
                                src={reviewer.avatar}
                                alt=""
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-white transition hover:opacity-90"
                              />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <div>
                                  <Link
                                    to={`/user/${reviewer.id}`}
                                    className="font-medium text-neutral-900 hover:underline"
                                  >
                                    {reviewer.name}
                                  </Link>
                                  <p className="text-xs text-neutral-500">{reviewer.handle}</p>
                                </div>
                            <time
                              className="text-xs text-neutral-400"
                              dateTime={entry.createdAt}
                            >
                              {formatRelativeTime(entry.createdAt)}
                            </time>
                          </div>
                          <div className="mt-2 flex gap-0.5" aria-label={`${entry.stars} de 5 estrelas`}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={cn(
                                  'text-base leading-none',
                                  star <= entry.stars ? 'text-fuchsia-500' : 'text-neutral-300',
                                )}
                                aria-hidden
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-neutral-700">{entry.comment}</p>
                          {entry.postId && entry.postTitle ? (
                            <button
                              type="button"
                              onClick={() => navigate(`/post/${entry.postId}`)}
                              className="mt-2 text-left text-xs font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
                            >
                              Sobre: {entry.postTitle}
                            </button>
                          ) : (
                            <p className="mt-2 text-xs uppercase tracking-wider text-neutral-400">
                              Avaliação ao perfil
                            </p>
                          )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </>
                ) : (
                  <p className="mt-6 text-sm text-neutral-500">
                    As avaliações recebidas por este perfil são privadas neste mock.
                  </p>
                )}
              </div>
            )}

            {section === 'friends' && (
              <div className="border-t border-neutral-200 px-6 py-6 md:px-8">
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Amigos</p>
                <p className="mt-2 text-sm text-neutral-600">
                  {canManageProfile
                    ? 'Pessoas da tua rede neste mock (ordenadas como na lista fixa de dados).'
                    : 'Sugestões de rede neste mock (lista fixa, exclui o titular do perfil).'}
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {profileFriends.map((friend) => (
                    <Link
                      key={friend.id}
                      to={`/user/${friend.id}`}
                      className="flex gap-4 rounded-2xl bg-stone-50 p-4 ring-1 ring-black/5 transition hover:ring-neutral-300"
                    >
                      <img
                        src={friend.avatar}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-display font-semibold text-neutral-900">
                            {friend.name}
                          </h3>
                          <span
                            className={cn(
                              'rounded-full bg-white px-2 py-0.5 font-display text-xs font-semibold ring-1 ring-black/5',
                              getTierColor(friend.tier),
                            )}
                          >
                            {getTierLabel(friend.tier)}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500">{friend.handle}</p>
                        <p className="mt-1 font-display text-lg font-light tabular-nums text-neutral-900">
                          {friend.rating.toFixed(3)}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{friend.bio}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <ProfileFeedSidebar />
      </div>
    </div>
  )
}
