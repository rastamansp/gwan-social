import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MinioPublicStorageService } from './storage/minio-public-storage.service'

@Module({
  imports: [ConfigModule],
  providers: [MinioPublicStorageService],
  exports: [MinioPublicStorageService],
})
export class InfrastructureModule {}
