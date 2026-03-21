import { createHash, randomBytes, randomUUID } from 'node:crypto'
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { Prisma } from '@prisma/client'
import type { User } from '@prisma/client'
import { PrismaClientInitializationError } from '@prisma/client/runtime/library'
import { parseJwtExpiresSec } from '../config'
import { PrismaService } from '../infrastructure/prisma/prisma.service'
import type { LoginDto } from './dto/login.dto'
import type { RegisterDto } from './dto/register.dto'

type RefreshTokenDelegate = Pick<PrismaService, 'refreshToken'>['refreshToken']
type TxOrRoot = { refreshToken: RefreshTokenDelegate }

export type AuthTokensResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private normalizeUsername(raw: string): string {
    return raw.trim().toLowerCase()
  }

  private accessExpiresSec(): number {
    return parseJwtExpiresSec(this.config.get<string>('JWT_ACCESS_EXPIRES_SEC'), 900)
  }

  private refreshExpiresSec(): number {
    return parseJwtExpiresSec(this.config.get<string>('JWT_REFRESH_EXPIRES_SEC'), 604800)
  }

  private hashRefreshToken(raw: string): string {
    return createHash('sha256').update(raw, 'utf8').digest('hex')
  }

  private async issueTokens(user: User, db: TxOrRoot = this.prisma): Promise<AuthTokensResponse> {
    const accessExpiresSec = this.accessExpiresSec()
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, username: user.username },
      { expiresIn: accessExpiresSec },
    )

    const rawRefresh = randomBytes(48).toString('base64url')
    const tokenHash = this.hashRefreshToken(rawRefresh)
    const expiresAt = new Date(Date.now() + this.refreshExpiresSec() * 1000)

    await db.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    })

    return {
      accessToken,
      refreshToken: rawRefresh,
      expiresIn: accessExpiresSec,
      tokenType: 'Bearer',
    }
  }

  /** Converte erros Prisma em HTTP claros e regista o detalhe no log do servidor. */
  private rethrowPrismaOrPass(e: unknown, context: string): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.error(`${context}: Prisma ${e.code} — ${e.message}`)
      if (e.code === 'P2002') {
        throw new UnprocessableEntityException('Não foi possível concluir o registo.')
      }
      const migrateHint =
        'Confirma que aplicaste as migrations nesta base (em apps/api: npx prisma migrate deploy).'
      throw new ServiceUnavailableException(`${migrateHint} (código ${e.code})`)
    }
    if (e instanceof Prisma.PrismaClientValidationError) {
      this.logger.error(`${context}: Prisma validation — ${e.message}`)
      throw new ServiceUnavailableException(
        'Esquema Prisma incompatível com a base. Executa migrations e prisma generate.',
      )
    }
    if (e instanceof PrismaClientInitializationError) {
      this.logger.error(`${context}: Prisma init — ${e.message}`)
      throw new ServiceUnavailableException('Não foi possível ligar à base de dados.')
    }
    throw e
  }

  async register(dto: RegisterDto): Promise<AuthTokensResponse> {
    const username = this.normalizeUsername(dto.username)
    const email = dto.email?.trim().toLowerCase() ?? null
    let passwordHash: string
    try {
      passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id })
    } catch (e) {
      this.logger.error(`register: argon2 — ${e instanceof Error ? e.message : String(e)}`)
      throw e
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            id: randomUUID(),
            username,
            email,
            displayName: dto.displayName.trim(),
            passwordHash,
            avatarUrl: null,
            headline: '',
          },
        })
        return this.issueTokens(user, tx)
      })
    } catch (e) {
      this.rethrowPrismaOrPass(e, 'register')
    }
  }

  async login(dto: LoginDto): Promise<AuthTokensResponse> {
    const username = this.normalizeUsername(dto.username)
    let user: User | null
    try {
      user = await this.prisma.user.findUnique({ where: { username } })
    } catch (e) {
      this.rethrowPrismaOrPass(e, 'login')
    }
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Credenciais inválidas.')
    }
    const ok = await argon2.verify(user.passwordHash, dto.password)
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas.')
    }
    try {
      return await this.issueTokens(user)
    } catch (e) {
      this.rethrowPrismaOrPass(e, 'login.issueTokens')
    }
  }

  async refresh(refreshTokenRaw: string): Promise<AuthTokensResponse> {
    const tokenHash = this.hashRefreshToken(refreshTokenRaw)
    let row
    try {
      row = await this.prisma.refreshToken.findFirst({
        where: {
          tokenHash,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      })
    } catch (e) {
      this.rethrowPrismaOrPass(e, 'refresh')
    }
    if (!row) {
      throw new UnauthorizedException('Sessão inválida.')
    }

    try {
      await this.prisma.refreshToken.update({
        where: { id: row.id },
        data: { revokedAt: new Date() },
      })
      return await this.issueTokens(row.user)
    } catch (e) {
      this.rethrowPrismaOrPass(e, 'refresh.issueTokens')
    }
  }

  async logout(refreshTokenRaw: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(refreshTokenRaw)
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }
}
