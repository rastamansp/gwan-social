import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { GetUserProfileUseCase } from '../../../application/use-cases/get-user-profile.use-case'
import { ListUserFriendsUseCase } from '../../../application/use-cases/list-user-friends.use-case'
import { ListUserPostsUseCase } from '../../../application/use-cases/list-user-posts.use-case'
import { ListUserRatingsReceivedUseCase } from '../../../application/use-cases/list-user-ratings-received.use-case'
import { HttpExceptionResponseDto } from '../swagger/error-responses.dto'
import {
  cursorDesc,
  limitFeedPostsDesc,
  limitFriendsDesc,
  PaginatedFriendIdsDto,
  PaginatedProfileRatedEntryDto,
  PaginatedSocialPostDto,
} from '../swagger/pagination.dto'
import { PublicProfileResponseDto } from '../swagger/public-profile-response.dto'

const userNotFound = () => new NotFoundException('Utilizador não encontrado')

@ApiTags('Utilizadores')
@Controller()
export class UsersController {
  constructor(
    private readonly listUserPosts: ListUserPostsUseCase,
    private readonly listUserRatings: ListUserRatingsReceivedUseCase,
    private readonly listUserFriends: ListUserFriendsUseCase,
    private readonly getUserProfile: GetUserProfileUseCase,
  ) {}

  @Get('users/:userId/posts')
  @ApiOperation({
    summary: 'Posts do autor',
    description: 'Posts do utilizador, ordenados como no feed; paginação por cursor.',
  })
  @ApiParam({ name: 'userId', example: 'user_001' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: limitFeedPostsDesc,
    schema: { default: 20, minimum: 1, maximum: 50, type: 'integer' },
  })
  @ApiQuery({ name: 'cursor', required: false, description: cursorDesc })
  @ApiOkResponse({ type: PaginatedSocialPostDto })
  @ApiNotFoundResponse({ description: 'Utilizador inexistente no fixture.', type: HttpExceptionResponseDto })
  userPosts(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const page = this.listUserPosts.execute({ userId, limit, cursor })
    if (!page) throw userNotFound()
    return page
  }

  @Get('users/:userId/ratings/received')
  @ApiOperation({
    summary: 'Avaliações recebidas',
    description: 'Lista paginada de avaliações onde o utilizador é o avaliado.',
  })
  @ApiParam({ name: 'userId', example: 'user_001' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: limitFeedPostsDesc,
    schema: { default: 20, minimum: 1, maximum: 50, type: 'integer' },
  })
  @ApiQuery({ name: 'cursor', required: false, description: cursorDesc })
  @ApiOkResponse({ type: PaginatedProfileRatedEntryDto })
  @ApiNotFoundResponse({ type: HttpExceptionResponseDto })
  userRatings(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const page = this.listUserRatings.execute({ userId, limit, cursor })
    if (!page) throw userNotFound()
    return page
  }

  @Get('users/:userId/friends')
  @ApiOperation({
    summary: 'Amigos (IDs)',
    description: 'IDs de utilizadores com amizade aceite; limite máximo 100 por página.',
  })
  @ApiParam({ name: 'userId', example: 'user_001' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: limitFriendsDesc,
    schema: { default: 50, minimum: 1, maximum: 100, type: 'integer' },
  })
  @ApiQuery({ name: 'cursor', required: false, description: cursorDesc })
  @ApiOkResponse({ type: PaginatedFriendIdsDto })
  @ApiNotFoundResponse({ type: HttpExceptionResponseDto })
  userFriends(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const page = this.listUserFriends.execute({ userId, limit, cursor })
    if (!page) throw userNotFound()
    return page
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Perfil público', description: 'Dados de perfil a partir do read model (fixtures).' })
  @ApiParam({ name: 'userId', example: 'user_001' })
  @ApiOkResponse({ type: PublicProfileResponseDto })
  @ApiNotFoundResponse({ type: HttpExceptionResponseDto })
  userProfile(@Param('userId') userId: string) {
    const user = this.getUserProfile.execute(userId)
    if (!user) throw userNotFound()
    return user
  }
}
