import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
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
import { CommentPostUseCase } from '../../../application/use-cases/comment-post.use-case'
import { DeleteCommentUseCase } from '../../../application/use-cases/delete-comment.use-case'
import { DeletePostUseCase } from '../../../application/use-cases/delete-post.use-case'
import { RatePostUseCase } from '../../../application/use-cases/rate-post.use-case'
import { GetPostByIdUseCase } from '../../../application/use-cases/get-post-by-id.use-case'
import { ListNearbyPostsUseCase } from '../../../application/use-cases/list-nearby-posts.use-case'
import { HttpExceptionResponseDto } from '../swagger/error-responses.dto'
import { cursorDesc, limitFeedPostsDesc, PaginatedSocialPostDto } from '../swagger/pagination.dto'
import { SocialPostDto } from '../swagger/social-post-response.dto'
import { CreateCommentDto } from './dto/create-comment.dto'
import { RatePostDto } from './dto/rate-post.dto'

@ApiTags('Feed e posts')
@Controller()
export class PostsController {
  constructor(
    private readonly listNearby: ListNearbyPostsUseCase,
    private readonly getPostById: GetPostByIdUseCase,
    private readonly deletePost: DeletePostUseCase,
    private readonly deleteComment: DeleteCommentUseCase,
    private readonly commentPost: CommentPostUseCase,
    private readonly ratePost: RatePostUseCase,
    private readonly meService: MeService,
  ) {}

  @Get('posts/nearby')
  @ApiOperation({
    summary: 'Posts próximos (placeholder)',
    description:
      'Posts recentes na base com `distanceKm` convencional até existir geolocalização; mesma forma que o feed.',
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
  async nearby(@Query('limit') limit?: string, @Query('cursor') cursor?: string) {
    return this.listNearby.execute({ limit, cursor })
  }

  @Get('posts/:postId')
  @ApiOperation({ summary: 'Detalhe de um post', description: 'Um único `SocialPost` do read model.' })
  @ApiParam({
    name: 'postId',
    description: 'ID do post na base de dados',
    example: 'uuid',
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

  @Post('posts/:postId/comments')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Comentar num post',
    description: 'Requer Bearer. O corpo deve conter `text` (1–2000 caracteres). Devolve o `SocialPost` atualizado.',
  })
  @ApiParam({ name: 'postId', description: 'ID do post', example: 'uuid' })
  @ApiBody({ type: CreateCommentDto })
  @ApiCreatedResponse({ description: 'Comentário criado; post com lista de comentários atualizada.', type: SocialPostDto })
  @ApiUnauthorizedResponse({ type: HttpExceptionResponseDto })
  @ApiBadRequestResponse({ description: 'Texto vazio ou demasiado longo.', type: HttpExceptionResponseDto })
  @ApiNotFoundResponse({ description: 'Post inexistente.', type: HttpExceptionResponseDto })
  async addComment(
    @Req() req: Request,
    @Param('postId') postId: string,
    @Body() body: CreateCommentDto,
  ) {
    const userId = await this.meService.requireUserIdFromBearer(req.headers.authorization)
    return this.commentPost.execute({
      postId,
      authorUserId: userId,
      text: body.text,
    })
  }

  @Post('posts/:postId/ratings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Avaliar um post (1–5 estrelas)',
    description:
      'Requer Bearer. Avalia o autor do post (`reviewee`). Uma avaliação por utilizador por post (reenvio atualiza o valor). Devolve o `SocialPost` atualizado.',
  })
  @ApiParam({ name: 'postId', description: 'ID do post', example: 'uuid' })
  @ApiBody({ type: RatePostDto })
  @ApiCreatedResponse({
    description: 'Avaliação registada; post com bloco de ratings atualizado.',
    type: SocialPostDto,
  })
  @ApiUnauthorizedResponse({ type: HttpExceptionResponseDto })
  @ApiBadRequestResponse({ description: 'Valor fora do intervalo 1–5.', type: HttpExceptionResponseDto })
  @ApiForbiddenResponse({
    description: 'Tentativa de avaliar o próprio post.',
    type: HttpExceptionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Post inexistente.', type: HttpExceptionResponseDto })
  async ratePostById(
    @Req() req: Request,
    @Param('postId') postId: string,
    @Body() body: RatePostDto,
  ) {
    const userId = await this.meService.requireUserIdFromBearer(req.headers.authorization)
    return this.ratePost.execute({
      postId,
      reviewerUserId: userId,
      value: body.value,
    })
  }

  @Delete('posts/:postId/comments/:commentId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Apagar comentário',
    description:
      'Requer Bearer. O autor do comentário ou o autor do post pode apagar. Devolve o `SocialPost` atualizado.',
  })
  @ApiParam({ name: 'postId', description: 'ID do post', example: 'uuid' })
  @ApiParam({ name: 'commentId', description: 'ID do comentário', example: 'uuid' })
  @ApiOkResponse({ description: 'Comentário removido; post com lista atualizada.', type: SocialPostDto })
  @ApiUnauthorizedResponse({ type: HttpExceptionResponseDto })
  @ApiForbiddenResponse({
    description: 'Sem permissão para apagar (não és autor do comentário nem do post).',
    type: HttpExceptionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Post ou comentário inexistente.', type: HttpExceptionResponseDto })
  async removeComment(
    @Req() req: Request,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    const userId = await this.meService.requireUserIdFromBearer(req.headers.authorization)
    return this.deleteComment.execute({
      actorUserId: userId,
      postId,
      commentId,
    })
  }

  @Delete('posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Apagar o meu post',
    description: 'Requer Bearer. Só o autor pode apagar o post.',
  })
  @ApiParam({ name: 'postId', example: 'post_uuid' })
  @ApiNoContentResponse({ description: 'Post removido.' })
  @ApiUnauthorizedResponse({ type: HttpExceptionResponseDto })
  @ApiForbiddenResponse({
    description: 'Autor diferente do token.',
    type: HttpExceptionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Post inexistente na base.', type: HttpExceptionResponseDto })
  async removePost(@Req() req: Request, @Param('postId') postId: string) {
    const userId = await this.meService.requireUserIdFromBearer(req.headers.authorization)
    await this.deletePost.execute({ actorUserId: userId, postId })
  }
}
