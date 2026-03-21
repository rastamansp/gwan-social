import { ApiProperty } from '@nestjs/swagger'

export class SocialLocationDto {
  @ApiProperty()
  name!: string

  @ApiProperty()
  city!: string

  @ApiProperty()
  country!: string
}

export class SocialAuthorDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  username!: string

  @ApiProperty()
  avatarUrl!: string

  @ApiProperty()
  score!: number

  @ApiProperty()
  headline!: string
}

export class SocialMediaDto {
  @ApiProperty()
  id!: string

  @ApiProperty({ enum: ['image', 'video'] })
  type!: 'image' | 'video'

  @ApiProperty()
  url!: string

  @ApiProperty()
  alt!: string
}

export class SocialPostStatsDto {
  @ApiProperty()
  views!: number

  @ApiProperty()
  likes!: number

  @ApiProperty()
  comments!: number

  @ApiProperty()
  ratingsCount!: number

  @ApiProperty()
  shares!: number
}

/** Distribuição de estrelas (chaves 1–5). */
export class SocialRatingDistributionDto {
  @ApiProperty()
  '1'!: number

  @ApiProperty()
  '2'!: number

  @ApiProperty()
  '3'!: number

  @ApiProperty()
  '4'!: number

  @ApiProperty()
  '5'!: number
}

export class SocialHighlightedRatingDto {
  @ApiProperty()
  id!: string

  @ApiProperty({ type: () => SocialAuthorDto })
  reviewer!: SocialAuthorDto

  @ApiProperty()
  value!: number

  @ApiProperty()
  comment!: string

  @ApiProperty({ description: 'ISO 8601' })
  createdAt!: string
}

export class SocialRatingsBlockDto {
  @ApiProperty()
  average!: number

  @ApiProperty({ type: () => SocialRatingDistributionDto })
  distribution!: SocialRatingDistributionDto

  @ApiProperty({ type: () => SocialHighlightedRatingDto, nullable: true })
  latestHighlightedRating!: SocialHighlightedRatingDto | null
}

export class SocialCommentPreviewDto {
  @ApiProperty()
  id!: string

  @ApiProperty({ type: () => SocialAuthorDto })
  author!: SocialAuthorDto

  @ApiProperty()
  text!: string

  @ApiProperty({ description: 'ISO 8601' })
  createdAt!: string
}

export class SocialPersonRefDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string
}

/** Read model de post alinhado ao front (`SocialPost`). */
export class SocialPostDto {
  @ApiProperty()
  id!: string

  @ApiProperty({ enum: ['featured_moment', 'feed_post'] })
  type!: 'featured_moment' | 'feed_post'

  @ApiProperty()
  title!: string

  @ApiProperty()
  description!: string

  @ApiProperty({ description: 'ISO 8601' })
  createdAt!: string

  @ApiProperty({ enum: ['public', 'followers', 'private'] })
  visibility!: 'public' | 'followers' | 'private'

  @ApiProperty({ description: 'Categoria editorial (ex.: moments, photos)' })
  category!: string

  @ApiProperty({ type: () => SocialLocationDto })
  location!: SocialLocationDto

  @ApiProperty({ type: () => SocialAuthorDto })
  author!: SocialAuthorDto

  @ApiProperty({ type: [SocialMediaDto] })
  media!: SocialMediaDto[]

  @ApiProperty({ type: () => SocialPostStatsDto })
  stats!: SocialPostStatsDto

  @ApiProperty({ type: () => SocialRatingsBlockDto })
  ratings!: SocialRatingsBlockDto

  @ApiProperty({ type: [SocialCommentPreviewDto] })
  commentsPreview!: SocialCommentPreviewDto[]

  @ApiProperty({ type: String, isArray: true })
  tags!: string[]

  @ApiProperty({ type: [SocialPersonRefDto] })
  people!: SocialPersonRefDto[]

  @ApiProperty()
  isTrending!: boolean

  @ApiProperty()
  isHighestRated!: boolean
}
