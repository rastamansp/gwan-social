import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { SocialScoreService } from './social-score.service'

@Global()
@Module({
  providers: [PrismaService, SocialScoreService],
  exports: [PrismaService, SocialScoreService],
})
export class PrismaModule {}
