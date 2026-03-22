import { Controller, Get, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { GetFeedUseCase } from '../../../application/use-cases/get-feed.use-case'
import { cursorDesc, limitFeedPostsDesc, PaginatedSocialPostDto } from '../swagger/pagination.dto'

@ApiTags('Feed e posts')
@Controller()
export class FeedController {
  constructor(private readonly getFeed: GetFeedUseCase) {}

  @Get('feed')
  @ApiOperation({
    summary: 'Feed principal',
    description:
      'Lista paginada de posts em PostgreSQL (Prisma), mais recentes primeiro. Sem posts na base, a lista vem vazia.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: limitFeedPostsDesc,
    schema: { default: 20, minimum: 1, maximum: 50, type: 'integer' },
    example: 20,
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: cursorDesc,
    example: 'eyJpIjoyMH0',
  })
  @ApiOkResponse({ description: 'Página de posts do feed.', type: PaginatedSocialPostDto })
  async feed(@Query('limit') limit?: string, @Query('cursor') cursor?: string) {
    return this.getFeed.execute({ limit, cursor })
  }
}
