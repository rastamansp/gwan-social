import { createHash, randomBytes, randomUUID } from 'node:crypto'
import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { Prisma } from '@prisma/client'
import type { User } from '@prisma/client'
import { PrismaService } from '../infrastructure/prisma/prisma.service'
import type { LoginDto } from './dto/login.dto'
import type { RegisterDto } from './dto/register.dto'

export type AuthTokensResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private normalizeUsername(raw: string): string {
    return raw.trim().toLowerCase()
  }

  private accessExpiresSec(): number {
    return parseInt(this.config.get<string>('JWT_ACCESS_EXPIRES_SEC') ?? '900', 10)
  }

  private refreshExpiresSec(): number {
    return parseInt(this.config.get<string>('JWT_REFRESH_EXPIRES_SEC') ?? '604800', 10)
  }

  private hashRefreshToken(raw: string): string {
    return createHash('sha256').update(raw, 'utf8').digest('hex')
  }

  private async issueTokens(user: User): Promise<AuthTokensResponse> {
    const accessExpiresSec = this.accessExpiresSec()
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, username: user.username },
      { expiresIn: accessExpiresSec },
    )

    const rawRefresh = randomBytes(48).toString('base64url')
    const tokenHash = this.hashRefreshToken(rawRefresh)
    const expiresAt = new Date(Date.now() + this.refreshExpiresSec() * 1000)

    await this.prisma.refreshToken.create({
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

  async register(dto: RegisterDto): Promise<AuthTokensResponse> {
    const username = this.normalizeUsername(dto.username)
    const email = dto.email?.trim().toLowerCase() ?? null
    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id })

    try {
      const user = await this.prisma.user.create({
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
      return this.issueTokens(user)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new UnprocessableEntityException('Não foi possível concluir o registo.')
      }
      throw e
    }
  }

  async login(dto: LoginDto): Promise<AuthTokensResponse> {
    const username = this.normalizeUsername(dto.username)
    const user = await this.prisma.user.findUnique({ where: { username } })
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Credenciais inválidas.')
    }
    const ok = await argon2.verify(user.passwordHash, dto.password)
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas.')
    }
    return this.issueTokens(user)
  }

  async refresh(refreshTokenRaw: string): Promise<AuthTokensResponse> {
    const tokenHash = this.hashRefreshToken(refreshTokenRaw)
    const row = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })
    if (!row) {
      throw new UnauthorizedException('Sessão inválida.')
    }

    await this.prisma.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    })

    return this.issueTokens(row.user)
  }

  async logout(refreshTokenRaw: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(refreshTokenRaw)
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }
}
