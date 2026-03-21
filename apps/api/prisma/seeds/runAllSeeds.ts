import type { PrismaClient } from '@prisma/client'
import { loadFixtures } from './loadFixtures'
import { seedComments } from './seedComments'
import { seedFriendships } from './seedFriendships'
import { seedPostMedia } from './seedPostMedia'
import { seedPostMentions } from './seedPostMentions'
import { seedPosts } from './seedPosts'
import { seedRatings } from './seedRatings'
import { seedUsers } from './seedUsers'

/**
 * Ordem respeitando FKs: users → posts → media → comments → ratings → friendships → mentions.
 */
export async function runAllSeeds(prisma: PrismaClient): Promise<void> {
  const fixtures = loadFixtures()
  const d = fixtures.domain

  await seedUsers(prisma, d.users)
  await seedPosts(prisma, d.posts)
  await seedPostMedia(prisma, d.postMedia)
  await seedComments(prisma, d.comments)
  await seedRatings(prisma, d.ratings)
  await seedFriendships(prisma, d.friendships)
  await seedPostMentions(prisma, d.postMentions)

  console.log(
    `Seed OK: ${d.users.length} users, ${d.posts.length} posts, ${d.postMedia.length} media, ${d.comments.length} comments, ${d.ratings.length} ratings, ${d.friendships.length} friendships, ${d.postMentions.length} mentions.`,
  )
}
