import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { GetHealthUseCase } from '../../../application/use-cases/get-health.use-case'

@ApiTags('Sistema')
@Controller()
export class HealthController {
  constructor(private readonly getHealth: GetHealthUseCase) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'OK', schema: { example: { ok: true } } })
  health() {
    return this.getHealth.execute()
  }
}
