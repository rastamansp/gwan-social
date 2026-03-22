import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import type { Request } from 'express'
import { MeService } from '../../../auth/me.service'
import { GetUserProfileUseCase } from '../../../application/use-cases/get-user-profile.use-case'
import { ListUserFriendsUseCase } from '../../../application/use-cases/list-user-friends.use-case'
import { ListUsersUseCase } from '../../../application/use-cases/list-users.use-case'
import { ListUserPostsUseCase } from '../../../application/use-cases/list-user-posts.use-case'
import { ListUserRatingsGivenUseCase } from '../../../application/use-cases/list-user-ratings-given.use-case'
import { ListUserRatingsReceivedUseCase } from '../../../application/use-cases/list-user-ratings-received.use-case'
import { HttpExceptionResponseDto } from '../swagger/error-responses.dto'
import {
  cursorDesc,
  limitFeedPostsDesc,
  limitFriendsDesc,
  limitUsersDirectoryDesc,
  PaginatedFriendIdsDto,
  PaginatedProfileRatedEntryDto,
  PaginatedProfileRatingGivenEntryDto,
  PaginatedPublicProfileDto,
  PaginatedSocialPostDto,
} from '../swagger/pagination.dto'
import { PublicProfileResponseDto } from '../swagger/public-profile-response.dto'

const userNotFound = () => new NotFoundException('Utilizador não encontrado')

@ApiTags('Utilizadores')
@Controller()
export class UsersController {
  constructor(
    private readonly listUsers: ListUsersUseCase,
    private readonly listUserPosts: ListUserPostsUseCase,
    private readonly listUserRatings: ListUserRatingsReceivedUseCase,
    private readonly listUserRatingsGiven: ListUserRatingsGivenUseCase,
    private readonly listUserFriends: ListUserFriendsUseCase,
    private readonly getUserProfile: GetUserProfileUseCase,
    private readonly meService: MeService,
  ) {}

  @Get('users')
  @ApiOperation({
    summary: 'Listar utilizadores registados',
    description:
      'Perfis públicos de todos os utilizadores na base, ordenados por nome de exibição; paginação por cursor (índice), como o feed.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: limitUsersDirectoryDesc,
    schema: { default: 50, minimum: 1, maximum: 100, type: 'integer' },
  })
  @ApiQuery({ name: 'cursor', required: false, description: cursorDesc })
  @ApiOkResponse({ type: PaginatedPublicProfileDto })
  async listAllUsers(@Query('limit') limit?: string, @Query('cursor') cursor?: string) {
    return this.listUsers.execute({ limit, cursor })
  }

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
  @ApiNotFoundResponse({ description: 'Utilizador inexistente.', type: HttpExceptionResponseDto })
  async userPosts(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const page = await this.listUserPosts.execute({ userId, limit, cursor })
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
  async userRatings(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const page = await this.listUserRatings.execute({ userId, limit, cursor })
    if (!page) throw userNotFound()
    return page
  }

  @Get('users/:userId/ratings/given')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Avaliações feitas pelo utilizador',
    description:
      'Lista paginada onde o utilizador é o avaliador (`reviewer`). Só o próprio utilizador autenticado pode consultar.',
  })
  @ApiParam({ name: 'userId', example: 'user_001' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: limitFeedPostsDesc,
    schema: { default: 20, minimum: 1, maximum: 50, type: 'integer' },
  })
  @ApiQuery({ name: 'cursor', required: false, description: cursorDesc })
  @ApiOkResponse({ type: PaginatedProfileRatingGivenEntryDto })
  @ApiUnauthorizedResponse({ type: HttpExceptionResponseDto })
  @ApiForbiddenResponse({ description: 'O token não corresponde ao userId.', type: HttpExceptionResponseDto })
  @ApiNotFoundResponse({ type: HttpExceptionResponseDto })
  async userRatingsGiven(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const meUserId = await this.meService.requireUserIdFromBearer(req.headers.authorization)
    if (meUserId !== userId) {
      throw new ForbiddenException('Só podes consultar as tuas próprias avaliações feitas.')
    }
    const page = await this.listUserRatingsGiven.execute({ userId, limit, cursor })
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
  async userFriends(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const page = await this.listUserFriends.execute({ userId, limit, cursor })
    if (!page) throw userNotFound()
    return page
  }

  @Get('users/:userId')
  @ApiOperation({
    summary: 'Perfil público',
    description:
      'Perfil público a partir de PostgreSQL (reputação derivada das avaliações recebidas).',
  })
  @ApiParam({ name: 'userId', example: 'user_001' })
  @ApiOkResponse({ type: PublicProfileResponseDto })
  @ApiNotFoundResponse({ type: HttpExceptionResponseDto })
  async userProfile(@Param('userId') userId: string) {
    const user = await this.getUserProfile.execute(userId)
    if (!user) throw userNotFound()
    return user
  }
}
