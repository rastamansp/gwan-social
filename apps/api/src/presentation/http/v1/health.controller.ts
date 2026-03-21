import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { GetHealthUseCase } from '../../../application/use-cases/get-health.use-case'
import { HealthOkDto } from '../swagger/health-response.dto'

@ApiTags('Sistema')
@Controller()
export class HealthController {
  constructor(private readonly getHealth: GetHealthUseCase) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check', description: 'Liveness simples para balanceadores e Docker.' })
  @ApiOkResponse({ description: 'Serviço disponível.', type: HealthOkDto })
  health() {
    return this.getHealth.execute()
  }
}
