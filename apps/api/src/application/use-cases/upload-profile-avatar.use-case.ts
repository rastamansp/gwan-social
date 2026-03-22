import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { buildMeUserDtoFromPrisma, type MeUserJson } from '../../auth/me-user.mapper'
import { MinioPublicStorageService } from '../../infrastructure/storage/minio-public-storage.service'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { SocialScoreService } from '../../infrastructure/prisma/social-score.service'

const MAX_BYTES = 2 * 1024 * 1024

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export type UploadProfileAvatarInput = {
  userId: string
  buffer: Buffer
  mimetype: string
  size: number
}

@Injectable()
export class UploadProfileAvatarUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MinioPublicStorageService,
    private readonly socialScores: SocialScoreService,
  ) {}

  async execute(input: UploadProfileAvatarInput): Promise<MeUserJson> {
    if (!this.storage.isConfigured()) {
      throw new ServiceUnavailableException('Upload de avatar não configurado (MinIO).')
    }

    const mime = input.mimetype?.toLowerCase().trim() ?? ''
    const ext = MIME_TO_EXT[mime]
    if (!ext) {
      throw new BadRequestException('Imagem inválida. Usa JPEG, PNG ou WebP.')
    }
    if (input.size > MAX_BYTES || input.buffer.length > MAX_BYTES) {
      throw new BadRequestException(`Ficheiro demasiado grande (máx. ${MAX_BYTES / 1024 / 1024} MB).`)
    }

    const existing = await this.prisma.user.findUnique({ where: { id: input.userId } })
    if (!existing) {
      throw new NotFoundException('Utilizador não encontrado.')
    }

    const key = `avatars/${input.userId}/${randomUUID()}.${ext}`
    await this.storage.putObject(key, input.buffer, mime)
    const publicUrl = this.storage.publicUrlForKey(key)

    await this.prisma.user.update({
      where: { id: input.userId },
      data: { avatarUrl: publicUrl },
    })

    const user = await this.prisma.user.findUnique({ where: { id: input.userId } })
    if (!user) {
      throw new NotFoundException('Utilizador não encontrado.')
    }

    const map = await this.socialScores.scoresForUserIds([user.id])
    return buildMeUserDtoFromPrisma(user, map.get(user.id) ?? 4)
  }
}
