import { Controller, Get, Param, Query, Res } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { GetPostByIdUseCase } from '../../../application/use-cases/get-post-by-id.use-case'
import { ListNearbyPostsUseCase } from '../../../application/use-cases/list-nearby-posts.use-case'

@ApiTags('Feed e posts')
@Controller()
export class PostsController {
  constructor(
    private readonly listNearby: ListNearbyPostsUseCase,
    private readonly getPostById: GetPostByIdUseCase,
  ) {}

  @Get('posts/nearby')
  @ApiOperation({ summary: 'Posts próximos (demo)' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  nearby(@Query('limit') limit?: string, @Query('cursor') cursor?: string) {
    return this.listNearby.execute({ limit, cursor })
  }

  @Get('posts/:postId')
  @ApiOperation({ summary: 'Detalhe de um post' })
  @ApiParam({ name: 'postId' })
  getOne(@Param('postId') postId: string, @Res({ passthrough: false }) res: Response) {
    const post = this.getPostById.execute(postId)
    if (!post) {
      res.status(404).json({ error: 'Post não encontrado' })
      return
    }
    res.json(post)
  }
}
