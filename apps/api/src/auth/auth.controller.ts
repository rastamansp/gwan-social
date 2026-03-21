import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { AuthTokensResponseDto } from '../presentation/http/swagger/auth-tokens-response.dto'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { RegisterDto } from './dto/register.dto'

@ApiTags('Autenticação')
@ApiTooManyRequestsResponse({
  description: 'Limite de taxa: máximo 5 pedidos por 60s por IP nestas rotas.',
})
@Controller('auth')
@Throttle({ default: { limit: 5, ttl: 60_000 } })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Registo de utilizador',
    description:
      'Cria utilizador em PostgreSQL (Prisma), gera par de tokens. Username: minúsculas, números e underscore. Password: mín. 8 caracteres.',
  })
  @ApiCreatedResponse({
    description: 'Utilizador criado; tokens JWT emitidos.',
    type: AuthTokensResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Corpo inválido (ValidationPipe): campos em falta ou formato incorreto.',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Username ou email já existente (unique constraint).',
    schema: { example: { statusCode: 422, message: 'Não foi possível concluir o registo.', error: 'Unprocessable Entity' } },
  })
  @ApiServiceUnavailableResponse({
    description:
      'Falha ao persistir (ligação DB, tabela em falta, etc.). Aplica `npx prisma migrate deploy` na base configurada em DATABASE_URL.',
    schema: {
      example: {
        statusCode: 503,
        message:
          'Confirma que aplicaste as migrations nesta base (em apps/api: npx prisma migrate deploy). (código P2021)',
      },
    },
  })
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto)
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login (username + password)',
    description: 'Devolve novos access/refresh tokens se as credenciais forem válidas.',
  })
  @ApiOkResponse({ description: 'Tokens emitidos.', type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ description: 'Corpo inválido.' })
  @ApiUnauthorizedResponse({
    description: 'Username inexistente ou password incorreta.',
    schema: { example: { statusCode: 401, message: 'Credenciais inválidas.', error: 'Unauthorized' } },
  })
  @ApiServiceUnavailableResponse({
    description: 'Erro ao aceder à base de dados ou emitir sessão.',
  })
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto)
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Renovar access token',
    description: 'Envia o refresh token opaco recebido no login/registo; o anterior é revogado.',
  })
  @ApiOkResponse({ description: 'Novo par de tokens.', type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ description: 'Corpo inválido (refreshToken em falta ou curto demais).' })
  @ApiUnauthorizedResponse({
    description: 'Refresh token inválido, revogado ou expirado.',
    schema: { example: { statusCode: 401, message: 'Sessão inválida.', error: 'Unauthorized' } },
  })
  @ApiServiceUnavailableResponse({ description: 'Erro ao aceder à base de dados.' })
  async refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken)
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Logout',
    description: 'Revoga o refresh token indicado (idempotente se já revogado).',
  })
  @ApiNoContentResponse({ description: 'Refresh token revogado; sem corpo.' })
  @ApiBadRequestResponse({ description: 'Corpo inválido.' })
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.auth.logout(dto.refreshToken)
  }
}
