import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { GetPostByIdUseCase } from '../../../application/use-cases/get-post-by-id.use-case'
import { ListNearbyPostsUseCase } from '../../../application/use-cases/list-nearby-posts.use-case'
import { HttpExceptionResponseDto } from '../swagger/error-responses.dto'
import { cursorDesc, limitFeedPostsDesc, PaginatedSocialPostDto } from '../swagger/pagination.dto'
import { SocialPostDto } from '../swagger/social-post-response.dto'

@ApiTags('Feed e posts')
@Controller()
export class PostsController {
  constructor(
    private readonly listNearby: ListNearbyPostsUseCase,
    private readonly getPostById: GetPostByIdUseCase,
  ) {}

  @Get('posts/nearby')
  @ApiOperation({
    summary: 'Posts próximos (demo)',
    description: 'Read model com distâncias simuladas; mesma forma que o feed.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: limitFeedPostsDesc,
    schema: { default: 20, minimum: 1, maximum: 50, type: 'integer' },
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: cursorDesc,
  })
  @ApiOkResponse({ description: 'Página de posts “nearby”.', type: PaginatedSocialPostDto })
  nearby(@Query('limit') limit?: string, @Query('cursor') cursor?: string) {
    return this.listNearby.execute({ limit, cursor })
  }

  @Get('posts/:postId')
  @ApiOperation({ summary: 'Detalhe de um post', description: 'Um único `SocialPost` do read model.' })
  @ApiParam({
    name: 'postId',
    description: 'ID do post (ex. do fixture)',
    example: 'post_001',
  })
  @ApiOkResponse({ description: 'Post encontrado.', type: SocialPostDto })
  @ApiNotFoundResponse({
    description: 'ID desconhecido.',
    type: HttpExceptionResponseDto,
  })
  async getOne(@Param('postId') postId: string) {
    const post = await this.getPostById.execute(postId)
    if (!post) {
      throw new NotFoundException('Post não encontrado')
    }
    return post
  }
}
