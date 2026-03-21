import { Controller, Get, NotFoundException, Req, UnauthorizedException } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import type { Request } from 'express'
import { MeService } from '../../../auth/me.service'
import { HttpExceptionResponseDto } from '../swagger/error-responses.dto'
import { MeUserResponseDto } from '../swagger/me-user-response.dto'

@ApiTags('Sessão')
@Controller()
export class SessionController {
  constructor(private readonly meService: MeService) {}

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
}
