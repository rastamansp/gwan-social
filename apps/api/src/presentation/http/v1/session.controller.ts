import { Body, Controller, Get, NotFoundException, Patch, Req, UnauthorizedException } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import type { Request } from 'express'
import { UpdateMeProfileDto } from '../../../auth/dto/update-me-profile.dto'
import { MeService } from '../../../auth/me.service'
import { UpdateMyProfileUseCase } from '../../../application/use-cases/update-my-profile.use-case'
import { HttpExceptionResponseDto } from '../swagger/error-responses.dto'
import { MeUserResponseDto } from '../swagger/me-user-response.dto'

@ApiTags('Sessão')
@Controller()
export class SessionController {
  constructor(
    private readonly meService: MeService,
    private readonly updateMyProfile: UpdateMyProfileUseCase,
  ) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Utilizador atual',
    description:
      'Com `Authorization: Bearer <accessToken>` devolve o utilizador (JWT + enriquecimento fixture/Prisma). Em dev, se `AUTH_FIXTURE_ME_FALLBACK=true`, pode responder sem Bearer a partir do fixture.',
  })
  @ApiOkResponse({
    description: 'Perfil “eu” para a SPA.',
    type: MeUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token em falta ou inválido (sem fallback fixture).',
    type: HttpExceptionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Fallback fixture ativo mas sessão default ausente no JSON.',
    type: HttpExceptionResponseDto,
  })
  async me(@Req() req: Request) {
    const auth = req.headers.authorization
    const result = await this.meService.resolve(auth)
    if (result.kind === 'ok' || result.kind === 'fixture') {
      return result.dto
    }
    if (result.kind === 'fixture_missing') {
      throw new NotFoundException('Utilizador de sessão não encontrado no fixture')
    }
    throw new UnauthorizedException('Não autenticado')
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar o meu perfil',
    description:
      'Requer Bearer. Atualiza `display_name`, `username` (único) e `bio` em PostgreSQL. Sem upload de ficheiros.',
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
      bio: dto.bio,
    })
  }
}
