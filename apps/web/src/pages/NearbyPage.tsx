import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'
import { PostCard } from '@/components/social/PostCard'
import { useAuth } from '@/contexts/AuthContext'
import { getNearbyPosts } from '@/data/mockUsers'
import { socialPostToLegacyPost } from '@/data/socialPosts.adapters'
import type { Post } from '@/data/legacyFeed.types'
import { isApiEnabled } from '@/lib/api/config'
import { ApiHttpError } from '@/lib/api/client'
import { fetchNearbyPosts } from '@/lib/api/endpoints'
import { loginPath } from '@/lib/routes'

function formatDistanceKm(km: number): string {
  if (km < 1) {
    const m = Math.round(km * 1000)
    return `${m} m`
  }
  return `${km.toFixed(1).replace('.', ',')} km`
}

export default function NearbyPage() {
  const { isAuthenticated } = useAuth()
  const { pathname, search } = useLocation()
  const useApi = isApiEnabled()

  const mockEntries = getNearbyPosts()

  const [apiEntries, setApiEntries] = useState<{ post: Post; distanceKm: number }[]>([])
  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    if (!useApi || !isAuthenticated) return
    let cancelled = false
    setApiLoading(true)
    setApiError(null)
    fetchNearbyPosts({ limit: 30 })
      .then((page) => {
        if (cancelled) return
        setApiEntries(
          page.items.map((row) => ({
            post: socialPostToLegacyPost(row.post),
            distanceKm: row.distanceKm,
          })),
        )
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const msg =
          e instanceof ApiHttpError
            ? `Erro ${e.status} ao carregar posts próximos.`
            : 'Não foi possível ligar à API.'
        setApiError(msg)
        setApiEntries([])
      })
      .finally(() => {
        if (!cancelled) setApiLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [useApi, isAuthenticated])

  if (!isAuthenticated) {
    const from = encodeURIComponent(`${pathname}${search}`)
    return <Navigate to={`${loginPath()}?from=${from}`} replace />
  }

  const entries = useApi ? apiEntries : mockEntries
  const subtitle = useApi
    ? 'Postagens próximas a partir da API (ordem e distâncias do fixture).'
    : 'Postagens de pessoas na tua área (demonstração — dados mock).'

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <main className="container mx-auto max-w-3xl flex-1 px-4 py-6">
        <header className="mb-6 flex items-start gap-3 animate-fade-up">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <MapPin className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Próximo</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </header>

        {useApi && apiLoading ? (
          <p className="text-center text-sm text-muted-foreground">A carregar…</p>
        ) : null}
        {useApi && apiError && entries.length === 0 ? (
          <p className="text-center text-sm text-destructive">{apiError}</p>
        ) : null}

        <div className="space-y-4">
          {entries.map(({ post, distanceKm }, i) => (
            <div key={post.id} className="relative">
              <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-border/50 bg-card/90 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
                <MapPin size={12} className="text-primary" aria-hidden />
                <span>{formatDistanceKm(distanceKm)}</span>
              </div>
              <PostCard post={post} animationDelay={i * 80} />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
