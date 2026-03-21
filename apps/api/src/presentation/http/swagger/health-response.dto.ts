import { ApiProperty } from '@nestjs/swagger'

export class HealthOkDto {
  @ApiProperty({ example: true })
  ok!: boolean
}
