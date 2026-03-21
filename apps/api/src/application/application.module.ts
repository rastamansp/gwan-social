import { Module } from '@nestjs/common'
import { InfrastructureModule } from '../infrastructure/infrastructure.module'
import { GetFeedUseCase } from './use-cases/get-feed.use-case'
import { GetHealthUseCase } from './use-cases/get-health.use-case'
import { GetPostByIdUseCase } from './use-cases/get-post-by-id.use-case'
import { GetSessionUserUseCase } from './use-cases/get-session-user.use-case'
import { GetUserProfileUseCase } from './use-cases/get-user-profile.use-case'
import { ListNearbyPostsUseCase } from './use-cases/list-nearby-posts.use-case'
import { ListUserFriendsUseCase } from './use-cases/list-user-friends.use-case'
import { ListUserPostsUseCase } from './use-cases/list-user-posts.use-case'
import { ListUserRatingsReceivedUseCase } from './use-cases/list-user-ratings-received.use-case'

const useCases = [
  GetHealthUseCase,
  GetFeedUseCase,
  ListNearbyPostsUseCase,
  GetPostByIdUseCase,
  GetSessionUserUseCase,
  GetUserProfileUseCase,
  ListUserPostsUseCase,
  ListUserRatingsReceivedUseCase,
  ListUserFriendsUseCase,
]

@Module({
  imports: [InfrastructureModule],
  providers: useCases,
  exports: useCases,
})
export class ApplicationModule {}
