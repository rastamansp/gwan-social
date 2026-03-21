import { Controller, Get, Req, Res } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { MeService } from '../../../auth/me.service'

@ApiTags('Sessão')
@Controller()
export class SessionController {
  constructor(private readonly meService: MeService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Utilizador autenticado (JWT) ou fallback fixture em dev' })
  @ApiResponse({ status: 401, description: 'Sem token válido (sem fallback)' })
  @ApiResponse({ status: 404, description: 'Fallback fixture sem utilizador de sessão' })
  async me(@Req() req: Request, @Res({ passthrough: false }) res: Response) {
    const auth = req.headers.authorization
    const result = await this.meService.resolve(auth)
    if (result.kind === 'ok' || result.kind === 'fixture') {
      res.json(result.dto)
      return
    }
    if (result.kind === 'fixture_missing') {
      res.status(404).json({ error: 'Utilizador de sessão não encontrado no fixture' })
      return
    }
    res.status(401).json({ error: 'Não autenticado' })
  }
}
