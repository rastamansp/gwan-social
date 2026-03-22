import { Navigate, useParams } from 'react-router-dom'
import { ProfileFeedLayout } from '@/components/profile/ProfileFeedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useSessionUser } from '@/contexts/SessionUserContext'
import { myProfilePath } from '@/lib/routes'

/** Perfil público por id (`/user/:userId`). O próprio utilizador é redirecionado para `/user`. */
export default function UserProfilePage() {
  const { userId = '' } = useParams()
  const { isAuthenticated } = useAuth()
  const { userId: sessionId } = useSessionUser()

  if (isAuthenticated && userId === sessionId) {
    return <Navigate to={myProfilePath()} replace />
  }

  return <ProfileFeedLayout profileUserId={userId} />
}
