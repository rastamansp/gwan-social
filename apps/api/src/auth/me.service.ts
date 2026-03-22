import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { buildMeUserDtoFromPrisma, type MeUserJson } from './me-user.mapper'
import { PrismaService } from '../infrastructure/prisma/prisma.service'
import { SocialScoreService } from '../infrastructure/prisma/social-score.service'

export type MeResolveResult =
  | { kind: 'ok'; dto: MeUserJson }
  | { kind: 'unauthorized' }

@Injectable()
export class MeService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly socialScores: SocialScoreService,
  ) {}

  async resolve(authorizationHeader: string | undefined): Promise<MeResolveResult> {
    const token = this.extractBearer(authorizationHeader)
    if (!token) {
      return { kind: 'unauthorized' }
    }
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token)
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
      if (!user) {
        return { kind: 'unauthorized' }
      }
      const map = await this.socialScores.scoresForUserIds([user.id])
      const dto = buildMeUserDtoFromPrisma(user, map.get(user.id) ?? 4)
      return { kind: 'ok', dto }
    } catch {
      return { kind: 'unauthorized' }
    }
  }

  private extractBearer(authorizationHeader: string | undefined): string | null {
    if (!authorizationHeader?.startsWith('Bearer ')) return null
    const t = authorizationHeader.slice(7).trim()
    return t.length > 0 ? t : null
  }

  /** `sub` do access JWT (Bearer). Lança 401 se token inválido ou ausente. */
  async requireUserIdFromBearer(authorizationHeader: string | undefined): Promise<string> {
    const token = this.extractBearer(authorizationHeader)
    if (!token) {
      throw new UnauthorizedException('Não autenticado')
    }
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token)
      if (typeof payload.sub !== 'string' || !payload.sub) {
        throw new UnauthorizedException('Token inválido')
      }
      return payload.sub
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e
      throw new UnauthorizedException('Token inválido')
    }
  }
}
