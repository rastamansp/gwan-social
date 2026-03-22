import { Module } from '@nestjs/common'
import { InfrastructureModule } from '../infrastructure/infrastructure.module'
import { GetFeedUseCase } from './use-cases/get-feed.use-case'
import { GetHealthUseCase } from './use-cases/get-health.use-case'
import { CreateUserPostUseCase } from './use-cases/create-user-post.use-case'
import { CommentPostUseCase } from './use-cases/comment-post.use-case'
import { DeleteCommentUseCase } from './use-cases/delete-comment.use-case'
import { DeletePostUseCase } from './use-cases/delete-post.use-case'
import { GetPostByIdUseCase } from './use-cases/get-post-by-id.use-case'
import { GetUserProfileUseCase } from './use-cases/get-user-profile.use-case'
import { ListNearbyPostsUseCase } from './use-cases/list-nearby-posts.use-case'
import { ListUserFriendsUseCase } from './use-cases/list-user-friends.use-case'
import { ListUsersUseCase } from './use-cases/list-users.use-case'
import { ListUserPostsUseCase } from './use-cases/list-user-posts.use-case'
import { ListUserRatingsGivenUseCase } from './use-cases/list-user-ratings-given.use-case'
import { ListUserRatingsReceivedUseCase } from './use-cases/list-user-ratings-received.use-case'
import { RatePostUseCase } from './use-cases/rate-post.use-case'
import { UpdateMyProfileUseCase } from './use-cases/update-my-profile.use-case'
import { UploadProfileAvatarUseCase } from './use-cases/upload-profile-avatar.use-case'

const useCases = [
  GetHealthUseCase,
  GetFeedUseCase,
  ListNearbyPostsUseCase,
  GetPostByIdUseCase,
  CreateUserPostUseCase,
  DeletePostUseCase,
  DeleteCommentUseCase,
  CommentPostUseCase,
  RatePostUseCase,
  GetUserProfileUseCase,
  ListUserPostsUseCase,
  ListUserRatingsReceivedUseCase,
  ListUserRatingsGivenUseCase,
  ListUserFriendsUseCase,
  ListUsersUseCase,
  UpdateMyProfileUseCase,
  UploadProfileAvatarUseCase,
]

@Module({
  imports: [InfrastructureModule],
  providers: useCases,
  exports: useCases,
})
export class ApplicationModule {}
