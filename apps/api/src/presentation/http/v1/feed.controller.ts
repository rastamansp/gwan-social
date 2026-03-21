import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { GetFeedUseCase } from '../../../application/use-cases/get-feed.use-case'

@ApiTags('Feed e posts')
@Controller()
export class FeedController {
  constructor(private readonly getFeed: GetFeedUseCase) {}

  @Get('feed')
  @ApiOperation({ summary: 'Feed principal' })
  @ApiQuery({ name: 'limit', required: false, schema: { default: 20 } })
  @ApiQuery({ name: 'cursor', required: false })
  feed(@Query('limit') limit?: string, @Query('cursor') cursor?: string) {
    return this.getFeed.execute({ limit, cursor })
  }
}
