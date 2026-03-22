import { Navigate, useLocation } from 'react-router-dom'

/** Redireciona `/user/:uuid/create-post/...` → `/user/create-post/...` (URLs antigas). */
export function LegacyCreatePostRedirect() {
  const { pathname, search } = useLocation()
  const to =
    pathname.replace(/^\/user\/[^/]+\/create-post/, '/user/create-post') || '/user/create-post'
  return <Navigate to={`${to}${search}`} replace />
}
