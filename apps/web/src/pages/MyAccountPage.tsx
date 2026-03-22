import { Navigate, useLocation } from 'react-router-dom'
import { ProfileFeedLayout } from '@/components/profile/ProfileFeedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { loginPath } from '@/lib/routes'

/** Conta autenticada em `/user` — funcionalidades de gestão (ex. apagar posts na API). */
export default function MyAccountPage() {
  const { isAuthenticated } = useAuth()
  const { pathname, search } = useLocation()

  if (!isAuthenticated) {
    const from = encodeURIComponent(`${pathname}${search}`)
    return <Navigate to={`${loginPath()}?from=${from}`} replace />
  }

  return <ProfileFeedLayout accountMode />
}
