import { Controller, Get, Param, Query, Res } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { GetUserProfileUseCase } from '../../../application/use-cases/get-user-profile.use-case'
import { ListUserFriendsUseCase } from '../../../application/use-cases/list-user-friends.use-case'
import { ListUserPostsUseCase } from '../../../application/use-cases/list-user-posts.use-case'
import { ListUserRatingsReceivedUseCase } from '../../../application/use-cases/list-user-ratings-received.use-case'

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
  @ApiOperation({ summary: 'Posts do autor' })
  @ApiParam({ name: 'userId' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  userPosts(
    @Param('userId') userId: string,
    @Res({ passthrough: false }) res: Response,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const page = this.listUserPosts.execute({ userId, limit, cursor })
    if (!page) {
      res.status(404).json({ error: 'Utilizador não encontrado' })
      return
    }
    res.json(page)
  }

  @Get('users/:userId/ratings/received')
  @ApiOperation({ summary: 'Avaliações recebidas' })
  @ApiParam({ name: 'userId' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  userRatings(
    @Param('userId') userId: string,
    @Res({ passthrough: false }) res: Response,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const page = this.listUserRatings.execute({ userId, limit, cursor })
    if (!page) {
      res.status(404).json({ error: 'Utilizador não encontrado' })
      return
    }
    res.json(page)
  }

  @Get('users/:userId/friends')
  @ApiOperation({ summary: 'IDs de amigos aceites' })
  @ApiParam({ name: 'userId' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  userFriends(
    @Param('userId') userId: string,
    @Res({ passthrough: false }) res: Response,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const page = this.listUserFriends.execute({ userId, limit, cursor })
    if (!page) {
      res.status(404).json({ error: 'Utilizador não encontrado' })
      return
    }
    res.json(page)
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Perfil público' })
  @ApiParam({ name: 'userId' })
  userProfile(@Param('userId') userId: string, @Res({ passthrough: false }) res: Response) {
    const user = this.getUserProfile.execute(userId)
    if (!user) {
      res.status(404).json({ error: 'Utilizador não encontrado' })
      return
    }
    res.json(user)
  }
}
