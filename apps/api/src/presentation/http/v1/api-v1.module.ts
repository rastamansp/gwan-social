import { Module } from '@nestjs/common'
import { AuthModule } from '../../../auth/auth.module'
import { ApplicationModule } from '../../../application/application.module'
import { FeedController } from './feed.controller'
import { HealthController } from './health.controller'
import { PostsController } from './posts.controller'
import { SessionController } from './session.controller'
import { UsersController } from './users.controller'

@Module({
  imports: [ApplicationModule, AuthModule],
  controllers: [HealthController, FeedController, PostsController, SessionController, UsersController],
})
export class ApiV1Module {}
