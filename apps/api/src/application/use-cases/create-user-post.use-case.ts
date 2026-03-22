import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import type { SocialPost } from '../../types/socialPost.types'
import { MinioPublicStorageService } from '../../infrastructure/storage/minio-public-storage.service'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { SocialScoreService } from '../../infrastructure/prisma/social-score.service'
import {
  socialPostFromPrisma,
  userIdsForPostScores,
  type PostWithFeedRelations,
} from '../mappers/prisma-post.mapper'

const POST_IMAGE_MAX_BYTES = 5 * 1024 * 1024
const MAX_POST_MEDIA_FILES = 10

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const CONTENT_MAX = 20_000

export type CreateUserPostImageInput = {
  buffer: Buffer
  mimetype: string
  size: number
}

export type CreateUserPostInput = {
  authorId: string
  content: string
  visibility: 'public' | 'followers'
  /** Uma ou mais imagens (cada uma vira uma linha `PostMedia` com `position` sequencial). */
  images?: CreateUserPostImageInput[] | null
}

const postInclude = {
  media: { orderBy: { position: 'asc' as const } },
  comments: { orderBy: { createdAt: 'desc' as const }, take: 20, include: { author: true } },
  ratings: { include: { reviewer: true }, orderBy: { createdAt: 'desc' as const }, take: 100 },
} as const

@Injectable()
export class CreateUserPostUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MinioPublicStorageService,
    private readonly config: ConfigService,
    private readonly socialScores: SocialScoreService,
  ) {}

  async execute(input: CreateUserPostInput): Promise<SocialPost> {
    const content = input.content.trim()
    if (content.length < 1) {
      throw new BadRequestException('O texto da postagem é obrigatório.')
    }
    if (content.length > CONTENT_MAX) {
      throw new BadRequestException(`Texto demasiado longo (máx. ${CONTENT_MAX} caracteres).`)
    }
    if (input.visibility !== 'public' && input.visibility !== 'followers') {
      throw new BadRequestException('Visibilidade inválida (usa public ou followers).')
    }

    const author = await this.prisma.user.findUnique({ where: { id: input.authorId } })
    if (!author) {
      throw new NotFoundException('Utilizador não encontrado.')
    }

    const imgs = (input.images ?? []).filter((x) => x.buffer && x.buffer.length > 0)
    if (imgs.length > MAX_POST_MEDIA_FILES) {
      throw new BadRequestException(`No máximo ${MAX_POST_MEDIA_FILES} imagens por post.`)
    }

    if (imgs.length > 0 && !this.storage.isConfigured()) {
      throw new ServiceUnavailableException('Upload de imagens não configurado (MinIO).')
    }

    const prefix =
      this.config.get<string>('MINIO_POST_KEY_PREFIX')?.trim().replace(/\/+$/, '') || 'post-images'

    const mediaRows: { id: string; url: string; position: number }[] = []

    for (let i = 0; i < imgs.length; i++) {
      const image = imgs[i]
      const mime = image.mimetype?.toLowerCase().trim() ?? ''
      const ext = MIME_TO_EXT[mime]
      if (!ext) {
        throw new BadRequestException('Imagem inválida. Usa JPEG, PNG ou WebP.')
      }
      if (image.size > POST_IMAGE_MAX_BYTES || image.buffer.length > POST_IMAGE_MAX_BYTES) {
        throw new BadRequestException(
          `Ficheiro demasiado grande (máx. ${POST_IMAGE_MAX_BYTES / 1024 / 1024} MB por imagem).`,
        )
      }
      const mediaId = randomUUID()
      const key = `${prefix}/${input.authorId}/${mediaId}.${ext}`
      await this.storage.putObject(key, image.buffer, mime)
      const publicUrl = this.storage.publicUrlForKey(key)
      mediaRows.push({ id: mediaId, url: publicUrl, position: i })
    }

    const postId = randomUUID()
    const now = new Date()

    await this.prisma.$transaction(async (tx) => {
      await tx.post.create({
        data: {
          id: postId,
          authorId: input.authorId,
          type: 'feed_post',
          content,
          createdAt: now,
          visibility: input.visibility,
          category: 'social',
          location: Prisma.JsonNull,
          tags: [] as unknown as Prisma.InputJsonValue,
          isTrending: false,
          isHighestRated: false,
        },
      })
      for (const m of mediaRows) {
        await tx.postMedia.create({
          data: {
            id: m.id,
            postId,
            type: 'image',
            url: m.url,
            alt: content.slice(0, 500),
            position: m.position,
          },
        })
      }
    })

    const row = await this.prisma.post.findUnique({
      where: { id: postId },
      include: postInclude,
    })
    if (!row) {
      throw new NotFoundException('Post não encontrado após criação.')
    }

    const scoreMap = await this.socialScores.scoresForUserIds(
      userIdsForPostScores(author, row as PostWithFeedRelations),
    )
    const getScore = (id: string) => scoreMap.get(id) ?? 4
    return socialPostFromPrisma(row as PostWithFeedRelations, author, getScore)
  }
}
