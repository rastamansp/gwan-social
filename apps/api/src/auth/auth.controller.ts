import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { RegisterDto } from './dto/register.dto'

@ApiTags('Autenticação')
@Controller('auth')
@Throttle({ default: { limit: 5, ttl: 60_000 } })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Registo de utilizador' })
  @ApiResponse({ status: 201, description: 'Tokens emitidos' })
  @ApiResponse({ status: 422, description: 'Validação ou duplicado' })
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto)
  }

  @Post('login')
  @ApiOperation({ summary: 'Login (username + password)' })
  @ApiResponse({ status: 200, description: 'Tokens emitidos' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto)
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar access token com refresh token' })
  @ApiResponse({ status: 200, description: 'Novos tokens' })
  @ApiResponse({ status: 401, description: 'Refresh inválido' })
  async refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken)
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Revogar refresh token' })
  @ApiResponse({ status: 204, description: 'Sessão terminada' })
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.auth.logout(dto.refreshToken)
  }
}
