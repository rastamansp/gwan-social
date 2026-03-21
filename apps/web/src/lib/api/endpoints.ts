import { apiGet, apiPatch, apiPost } from '@/lib/api/client'
import { parseAuthTokensResponse } from '@/lib/api/authTokens'
import type { AuthTokens } from '@/lib/api/authStorage'
import type { ApiMeUserDto, ApiPublicUserDto } from '@/lib/api/mapApiUserToProfile'
import type { PaginatedResult } from '@/lib/api/types'
import type { ProfileRatedEntry } from '@/data/fixture-types'
import type { SocialPost } from '@/data/socialPost.types'

export interface HealthResponse {
  ok: boolean
}

export interface NearbyPostRow {
  post: SocialPost
  distanceKm: number
}

export async function fetchHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>('/health')
}

export async function fetchLogin(body: { username: string; password: string }): Promise<AuthTokens> {
  const raw = await apiPost<unknown>('/auth/login', body, { skipAuth: true })
  return parseAuthTokensResponse(raw)
}

export async function fetchRegister(body: {
  displayName: string
  username: string
  password: string
  email?: string
}): Promise<AuthTokens> {
  const raw = await apiPost<unknown>('/auth/register', body, { skipAuth: true })
  return parseAuthTokensResponse(raw)
}

export async function fetchRefresh(refreshToken: string): Promise<AuthTokens> {
  const raw = await apiPost<unknown>('/auth/refresh', { refreshToken }, { skipAuth: true })
  return parseAuthTokensResponse(raw)
}

export async function fetchLogout(refreshToken: string): Promise<void> {
  await apiPost<void>('/auth/logout', { refreshToken }, { skipAuth: true })
}

export async function fetchFeed(params?: {
  limit?: number
  cursor?: string | null
}): Promise<PaginatedResult<SocialPost>> {
  return apiGet<PaginatedResult<SocialPost>>('/feed', {
    query: {
      limit: params?.limit,
      cursor: params?.cursor ?? undefined,
    },
  })
}

export async function fetchPostById(postId: string): Promise<SocialPost> {
  return apiGet<SocialPost>(`/posts/${encodeURIComponent(postId)}`)
}

export async function fetchNearbyPosts(params?: {
  limit?: number
  cursor?: string | null
}): Promise<PaginatedResult<NearbyPostRow>> {
  return apiGet<PaginatedResult<NearbyPostRow>>('/posts/nearby', {
    query: {
      limit: params?.limit,
      cursor: params?.cursor ?? undefined,
    },
  })
}

export async function fetchMe(): Promise<ApiMeUserDto> {
  return apiGet<ApiMeUserDto>('/me')
}

export async function fetchPatchMe(body: {
  displayName: string
  username: string
  bio?: string
}): Promise<ApiMeUserDto> {
  return apiPatch<ApiMeUserDto>('/me', body)
}

export async function fetchUserProfile(userId: string): Promise<ApiPublicUserDto> {
  return apiGet<ApiPublicUserDto>(`/users/${encodeURIComponent(userId)}`)
}

export async function fetchUserPosts(
  userId: string,
  params?: { limit?: number; cursor?: string | null },
): Promise<PaginatedResult<SocialPost>> {
  return apiGet<PaginatedResult<SocialPost>>(`/users/${encodeURIComponent(userId)}/posts`, {
    query: {
      limit: params?.limit,
      cursor: params?.cursor ?? undefined,
    },
  })
}

export async function fetchUserRatingsReceived(
  userId: string,
  params?: { limit?: number; cursor?: string | null },
): Promise<PaginatedResult<ProfileRatedEntry>> {
  return apiGet<PaginatedResult<ProfileRatedEntry>>(
    `/users/${encodeURIComponent(userId)}/ratings/received`,
    {
      query: {
        limit: params?.limit,
        cursor: params?.cursor ?? undefined,
      },
    },
  )
}

export async function fetchUserFriends(
  userId: string,
  params?: { limit?: number; cursor?: string | null },
): Promise<PaginatedResult<string>> {
  return apiGet<PaginatedResult<string>>(`/users/${encodeURIComponent(userId)}/friends`, {
    query: {
      limit: params?.limit,
      cursor: params?.cursor ?? undefined,
    },
  })
}
