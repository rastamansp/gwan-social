import { Injectable } from '@nestjs/common'
import type { ProfileRatingGivenEntry } from '../../types/fixture-types'
import { clampLimit, paginateByIndex, type PaginatedResult } from '../shared/pagination'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

export interface ListUserRatingsGivenInput {
  userId: string
  limit?: string
  cursor?: string
}

function postTitleFromContent(content: string | null | undefined): string | null {
  if (content == null || !content.trim()) return null
  const line = content.split('\n').find((l) => l.trim()) ?? content
  const t = line.trim()
  return t.length > 120 ? `${t.slice(0, 117)}…` : t
}

@Injectable()
export class ListUserRatingsGivenUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    input: ListUserRatingsGivenInput,
  ): Promise<PaginatedResult<ProfileRatingGivenEntry> | null> {
    const lim = clampLimit(input.limit)

    const exists = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true },
    })
    if (!exists) return null

    const all = await this.prisma.rating.findMany({
      where: { reviewerId: input.userId },
      orderBy: { createdAt: 'desc' },
      include: { post: { select: { content: true } } },
    })

    const entries: ProfileRatingGivenEntry[] = all.map((r) => ({
      id: r.id,
      revieweeId: r.revieweeId,
      stars: Math.min(5, Math.max(1, Math.round(r.value))) as ProfileRatingGivenEntry['stars'],
      comment: r.comment,
      postId: r.postId,
      postTitle: postTitleFromContent(r.post?.content),
      createdAt: r.createdAt.toISOString(),
    }))

    return paginateByIndex(entries, input.cursor, lim)
  }
}
