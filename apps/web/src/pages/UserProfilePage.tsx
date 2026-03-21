import { useParams } from 'react-router-dom'
import { ProfileFeedLayout } from '@/components/profile/ProfileFeedLayout'

/** Perfil público por id (`/user/:userId`), alimentado pelo mesmo layout que “Meu perfil”. */
export default function UserProfilePage() {
  const { userId = '' } = useParams()
  return <ProfileFeedLayout profileUserId={userId} />
}
