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

export function userProfilePath(userId: string) {
  return `/user/${userId}`
}

export function userProfileEditPath(userId: string) {
  return `/user/${userId}/edit`
}

export function userCreatePostPath(userId: string, step?: CreatePostStep) {
  const base = `/user/${userId}/create-post`
  return step ? `${base}/${step}` : base
}

export function isCreatePostPathname(pathname: string) {
  return /\/user\/[^/]+\/create-post(?:\/|$)/.test(pathname)
}
