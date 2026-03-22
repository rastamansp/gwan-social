import { Injectable } from '@nestjs/common'
import type { PublicProfileDto } from '../mappers/profile.mappers'
import { publicUserFromPrisma } from '../mappers/profile.mappers'
import {
  clampLimit,
  encodeIndexCursor,
  parseIndexCursor,
  type PaginatedResult,
} from '../shared/pagination'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { SocialScoreService } from '../../infrastructure/prisma/social-score.service'

export interface ListUsersInput {
  limit?: string
  cursor?: string
}

@Injectable()
export class ListUsersUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socialScores: SocialScoreService,
  ) {}

  async execute(input: ListUsersInput): Promise<PaginatedResult<PublicProfileDto>> {
    const lim = clampLimit(input.limit, 50, 100)
    const skip = parseIndexCursor(input.cursor)

    const rows = await this.prisma.user.findMany({
      orderBy: [{ displayName: 'asc' }, { id: 'asc' }],
      skip,
      take: lim + 1,
    })

    const hasMore = rows.length > lim
    const pageRows = hasMore ? rows.slice(0, lim) : rows

    const ids = pageRows.map((u) => u.id)
    const scoreMap = await this.socialScores.scoresForUserIds(ids)

    const items: PublicProfileDto[] = pageRows.map((u) =>
      publicUserFromPrisma(u, scoreMap.get(u.id) ?? 4),
    )

    const nextIndex = skip + pageRows.length
    return {
      items,
      nextCursor: hasMore ? encodeIndexCursor(nextIndex) : null,
      hasMore,
    }
  }
}
