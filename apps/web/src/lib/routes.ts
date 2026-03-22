/** URLs e segmentos da app (inglês). */

export function loginPath() {
  return '/login'
}

export function registerPath() {
  return '/register'
}

export const CREATE_POST_STEPS = {
  content: 'content',
  media: 'media',
  review: 'review',
} as const

export type CreatePostStep = (typeof CREATE_POST_STEPS)[keyof typeof CREATE_POST_STEPS]

/** Perfil da conta autenticada (funcionalidades próprias, ex. apagar posts). */
export function myProfilePath() {
  return '/user'
}

export function userProfilePath(userId: string) {
  return `/user/${userId}`
}

export function userProfileEditPath(userId: string) {
  return `/user/${userId}/edit`
}

const CREATE_POST_BASE = '/user/create-post'

/** Wizard de nova postagem (só a conta autenticada). */
export function createPostPath(step?: CreatePostStep) {
  return step ? `${CREATE_POST_BASE}/${step}` : CREATE_POST_BASE
}

export function isCreatePostPathname(pathname: string) {
  return (
    /^\/user\/create-post(?:\/|$)/.test(pathname) ||
    /^\/user\/[^/]+\/create-post(?:\/|$)/.test(pathname)
  )
}
