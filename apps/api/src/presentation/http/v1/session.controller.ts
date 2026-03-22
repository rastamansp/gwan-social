import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import type { Request } from 'express'
import { UpdateMeProfileDto } from '../../../auth/dto/update-me-profile.dto'
import { MeService } from '../../../auth/me.service'
import { CreateUserPostUseCase } from '../../../application/use-cases/create-user-post.use-case'
import { UpdateMyProfileUseCase } from '../../../application/use-cases/update-my-profile.use-case'
import { UploadProfileAvatarUseCase } from '../../../application/use-cases/upload-profile-avatar.use-case'
import { HttpExceptionResponseDto } from '../swagger/error-responses.dto'
import { MeUserResponseDto } from '../swagger/me-user-response.dto'
import { SocialPostDto } from '../swagger/social-post-response.dto'

const AVATAR_UPLOAD_MAX_BYTES = 2 * 1024 * 1024
const POST_IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024
const POST_MEDIA_MAX_FILES = 10

@ApiTags('Sessão')
@Controller()
export class SessionController {
  constructor(
    private readonly meService: MeService,
    private readonly updateMyProfile: UpdateMyProfileUseCase,
    private readonly uploadProfileAvatar: UploadProfileAvatarUseCase,
    private readonly createUserPost: CreateUserPostUseCase,
  ) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Utilizador atual',
    description: 'Requer `Authorization: Bearer <accessToken>`; devolve o perfil a partir de PostgreSQL.',
  })
  @ApiOkResponse({
    description: 'Perfil “eu” para a SPA.',
    type: MeUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token em falta ou inválido.',
    type: HttpExceptionResponseDto,
  })
  async me(@Req() req: Request) {
    const auth = req.headers.authorization
    const result = await this.meService.resolve(auth)
    if (result.kind === 'ok') {
      return result.dto
    }
    throw new UnauthorizedException('Não autenticado')
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar o meu perfil',
    description:
      'Requer Bearer. Atualiza `display_name`, `username` (único), `headline`, `bio` e opcionalmente `email` (único) em PostgreSQL. Sem upload de ficheiros.',
  })
  @ApiBody({ type: UpdateMeProfileDto })
  @ApiOkResponse({ description: 'Perfil atualizado (mesmo formato que GET /me).', type: MeUserResponseDto })
  @ApiBadRequestResponse({ description: 'Corpo inválido (ValidationPipe).' })
  @ApiUnauthorizedResponse({
    description: 'Token em falta ou inválido.',
    type: HttpExceptionResponseDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Username já em uso.',
    type: HttpExceptionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Utilizador do token não existe na base.',
    type: HttpExceptionResponseDto,
  })
  async patchMe(@Req() req: Request, @Body() dto: UpdateMeProfileDto) {
    const userId = await this.meService.requireUserIdFromBearer(req.headers.authorization)
    return this.updateMyProfile.execute({
      userId,
      displayName: dto.displayName,
      username: dto.username,
      headline: dto.headline,
      bio: dto.bio,
      email: dto.email,
    })
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: AVATAR_UPLOAD_MAX_BYTES },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload do avatar',
    description:
      'Requer Bearer. Envia campo `file` (JPEG, PNG ou WebP, máx. 2 MB). Grava no MinIO (S3) e atualiza `avatarUrl` em PostgreSQL.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Imagem de perfil' },
      },
    },
  })
  @ApiOkResponse({ description: 'Perfil atualizado (mesmo formato que GET /me).', type: MeUserResponseDto })
  @ApiBadRequestResponse({ description: 'Ficheiro em falta ou tipo/tamanho inválido.' })
  @ApiUnauthorizedResponse({
    description: 'Token em falta ou inválido.',
    type: HttpExceptionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Utilizador do token não existe na base.',
    type: HttpExceptionResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'MinIO não configurado.',
    type: HttpExceptionResponseDto,
  })
  async postMeAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File | undefined) {
    const userId = await this.meService.requireUserIdFromBearer(req.headers.authorization)
    if (!file?.buffer) {
      throw new BadRequestException('Envia um ficheiro no campo file.')
    }
    return this.uploadProfileAvatar.execute({
      userId,
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
    })
  }

  @Post('me/posts')
  @UseInterceptors(
    FilesInterceptor('files', POST_MEDIA_MAX_FILES, {
      storage: memoryStorage(),
      limits: { fileSize: POST_IMAGE_UPLOAD_MAX_BYTES },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Criar nova postagem',
    description:
      'Requer Bearer. Campos `content`, `visibility` (public | followers). Campo opcional `files` (repetir no multipart para várias imagens; JPEG/PNG/WebP, máx. 5 MB cada, até 10 ficheiros) — grava em MinIO (`MINIO_POST_KEY_PREFIX`, omissão `post-images/`).',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['content', 'visibility'],
      properties: {
        content: { type: 'string', description: 'Texto da postagem' },
        visibility: { type: 'string', enum: ['public', 'followers'] },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Zero ou mais imagens (mesmo nome de campo `files`)',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Post criado (read model).', type: SocialPostDto })
  @ApiBadRequestResponse({ description: 'Campos inválidos ou ficheiro inválido.' })
  @ApiUnauthorizedResponse({
    description: 'Token em falta ou inválido.',
    type: HttpExceptionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Utilizador do token não existe na base.',
    type: HttpExceptionResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'MinIO não configurado e foi enviada imagem.',
    type: HttpExceptionResponseDto,
  })
  async postMePosts(@Req() req: Request, @UploadedFiles() files: Express.Multer.File[] | undefined) {
    const userId = await this.meService.requireUserIdFromBearer(req.headers.authorization)
    const body = req.body as { content?: string; visibility?: string }
    const visibilityRaw =
      typeof body.visibility === 'string' ? body.visibility.trim().toLowerCase() : ''
    const content = typeof body.content === 'string' ? body.content : ''

    const images = (files ?? [])
      .filter((f) => f?.buffer && f.buffer.length > 0)
      .map((f) => ({ buffer: f.buffer, mimetype: f.mimetype, size: f.size }))

    return this.createUserPost.execute({
      authorId: userId,
      content,
      visibility: visibilityRaw as 'public' | 'followers',
      images: images.length > 0 ? images : null,
    })
  }
}
