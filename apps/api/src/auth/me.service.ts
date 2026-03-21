import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { FixtureReadModelPort } from '../application/ports/fixture-read-model.port'
import { FIXTURE_READ_MODEL_PORT } from '../application/ports/fixture-read-model.token'
import { GetSessionUserUseCase } from '../application/use-cases/get-session-user.use-case'
import { PrismaService } from '../infrastructure/prisma/prisma.service'
import { buildMeUserDtoFromPrisma, type MeUserJson } from './me-user.mapper'

export type MeResolveResult =
  | { kind: 'ok'; dto: MeUserJson }
  | { kind: 'fixture'; dto: MeUserJson }
  | { kind: 'fixture_missing' }
  | { kind: 'unauthorized' }

@Injectable()
export class MeService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly getSessionUser: GetSessionUserUseCase,
    @Inject(FIXTURE_READ_MODEL_PORT) private readonly fixtures: FixtureReadModelPort,
  ) {}

  async resolve(authorizationHeader: string | undefined): Promise<MeResolveResult> {
    const token = this.extractBearer(authorizationHeader)
    if (token) {
      try {
        const payload = await this.jwt.verifyAsync<{ sub: string }>(token)
        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
        if (!user) {
          return { kind: 'unauthorized' }
        }
        const h = this.fixtures.getHydrated()
        const dto = buildMeUserDtoFromPrisma(user, h)
        return { kind: 'ok', dto }
      } catch {
        return { kind: 'unauthorized' }
      }
    }

    const fallback = this.config.get<string>('AUTH_FIXTURE_ME_FALLBACK') === 'true'
    if (fallback) {
      const fixture = this.getSessionUser.execute()
      if (fixture) {
        return { kind: 'fixture', dto: fixture as MeUserJson }
      }
      return { kind: 'fixture_missing' }
    }

    return { kind: 'unauthorized' }
  }

  private extractBearer(authorizationHeader: string | undefined): string | null {
    if (!authorizationHeader?.startsWith('Bearer ')) return null
    const t = authorizationHeader.slice(7).trim()
    return t.length > 0 ? t : null
  }
}
