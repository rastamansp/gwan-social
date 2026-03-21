import { Module } from '@nestjs/common'
import { FIXTURE_READ_MODEL_PORT } from '../application/ports/fixture-read-model.token'
import { FixtureReadModelAdapter } from './fixtures/fixture-read-model.adapter'

@Module({
  providers: [
    FixtureReadModelAdapter,
    { provide: FIXTURE_READ_MODEL_PORT, useExisting: FixtureReadModelAdapter },
  ],
  exports: [FIXTURE_READ_MODEL_PORT, FixtureReadModelAdapter],
})
export class InfrastructureModule {}
