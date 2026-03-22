import * as argon2 from 'argon2'
import { Prisma, type PrismaClient } from '@prisma/client'

/**
 * Utilizador **apenas na base** (UUID não existe no `gwan-social.fixtures.json`),
 * com postagens para testar `/user/:id` e `GET /users/:id/posts` com Prisma.
 *
 * Login: username **`gwanseed_posts`** · senha **`DemoPosts123!`**
 * (Evita colisão com contas criadas manualmente com `demo_posts`.)
 * Perfil: **`/user/cafebabe-1111-4111-8111-111111111111`**
 * Amigos: ligações `accepted` em PostgreSQL para `user_001`…`user_005` (perfis do fixture).
 */
export const DEMO_AUTHOR_USER_ID = 'cafebabe-1111-4111-8111-111111111111'
/** Utilizador único do seed — não uses o mesmo nome num registo manual. */
export const DEMO_AUTHOR_USERNAME = 'gwanseed_posts'
export const DEMO_AUTHOR_PASSWORD_PLAIN = 'DemoPosts123!'

const DEMO_POST_A = 'cafebabe-2222-4222-8222-222222222221'
const DEMO_POST_B = 'cafebabe-2222-4222-8222-222222222222'
const DEMO_MEDIA_A = 'cafebabe-3333-4333-8333-333333333331'
const DEMO_MEDIA_B = 'cafebabe-3333-4333-8333-333333333332'

const DEMO_CONTENT_A =
  'Primeira postagem (seed)\n\nTexto vindo do seed Prisma — autor só existe na base de dados.'
const DEMO_CONTENT_B =
  'Momento em destaque (seed)\n\nSegundo post do utilizador demo; pode abrir em /post/:id.'

/** Amizades `accepted` com utilizadores do fixture (seed principal já os criou em `users`). */
const DEMO_AUTHOR_FRIEND_IDS = ['user_001', 'user_002', 'user_003', 'user_004', 'user_005'] as const

export async function seedDemoAuthorWithPosts(prisma: PrismaClient): Promise<void> {
  const passwordHash = await argon2.hash(DEMO_AUTHOR_PASSWORD_PLAIN, { type: argon2.argon2id })

  await prisma.user.upsert({
    where: { id: DEMO_AUTHOR_USER_ID },
    create: {
      id: DEMO_AUTHOR_USER_ID,
      username: DEMO_AUTHOR_USERNAME,
      displayName: 'Conta demo (posts na API)',
      email: 'gwanseed_posts@seed.local',
      passwordHash,
      headline: 'Seed Prisma — reputação default',
      bio: 'Utilizador criado por `seedDemoAuthorWithPosts` para desenvolvimento.',
      avatarUrl: null,
    },
    update: {
      username: DEMO_AUTHOR_USERNAME,
      displayName: 'Conta demo (posts na API)',
      email: 'gwanseed_posts@seed.local',
      passwordHash,
      headline: 'Seed Prisma — reputação default',
      bio: 'Utilizador criado por `seedDemoAuthorWithPosts` para desenvolvimento.',
    },
  })

  const now = new Date()
  const isoA = new Date(now.getTime() - 86_400_000).toISOString()
  const isoB = new Date(now.getTime() - 172_800_000).toISOString()

  await prisma.post.upsert({
    where: { id: DEMO_POST_A },
    create: {
      id: DEMO_POST_A,
      authorId: DEMO_AUTHOR_USER_ID,
      type: 'feed_post',
      content: DEMO_CONTENT_A,
      createdAt: new Date(isoA),
      visibility: 'public',
      category: 'moments',
      location: Prisma.JsonNull,
      tags: ['seed', 'api'] as unknown as Prisma.InputJsonValue,
      isTrending: false,
      isHighestRated: false,
    },
    update: {
      authorId: DEMO_AUTHOR_USER_ID,
      type: 'feed_post',
      content: DEMO_CONTENT_A,
      createdAt: new Date(isoA),
      visibility: 'public',
      category: 'moments',
      tags: ['seed', 'api'] as unknown as Prisma.InputJsonValue,
      isTrending: false,
      isHighestRated: false,
    },
  })

  await prisma.post.upsert({
    where: { id: DEMO_POST_B },
    create: {
      id: DEMO_POST_B,
      authorId: DEMO_AUTHOR_USER_ID,
      type: 'featured_moment',
      content: DEMO_CONTENT_B,
      createdAt: new Date(isoB),
      visibility: 'public',
      category: 'photos',
      location: {
        name: 'Lisboa',
        city: 'Lisboa',
        country: 'Portugal',
      } as unknown as Prisma.InputJsonValue,
      tags: ['viagem'] as unknown as Prisma.InputJsonValue,
      isTrending: true,
      isHighestRated: false,
    },
    update: {
      authorId: DEMO_AUTHOR_USER_ID,
      type: 'featured_moment',
      content: DEMO_CONTENT_B,
      createdAt: new Date(isoB),
      visibility: 'public',
      category: 'photos',
      location: {
        name: 'Lisboa',
        city: 'Lisboa',
        country: 'Portugal',
      } as unknown as Prisma.InputJsonValue,
      tags: ['viagem'] as unknown as Prisma.InputJsonValue,
      isTrending: true,
      isHighestRated: false,
    },
  })

  await prisma.postMedia.upsert({
    where: { id: DEMO_MEDIA_A },
    create: {
      id: DEMO_MEDIA_A,
      postId: DEMO_POST_A,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      alt: 'Paisagem (Unsplash)',
      position: 0,
    },
    update: {
      postId: DEMO_POST_A,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      alt: 'Paisagem (Unsplash)',
      position: 0,
    },
  })

  await prisma.postMedia.upsert({
    where: { id: DEMO_MEDIA_B },
    create: {
      id: DEMO_MEDIA_B,
      postId: DEMO_POST_B,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
      alt: 'Natureza (Unsplash)',
      position: 0,
    },
    update: {
      postId: DEMO_POST_B,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
      alt: 'Natureza (Unsplash)',
      position: 0,
    },
  })

  for (const friendId of DEMO_AUTHOR_FRIEND_IDS) {
    await prisma.friendship.upsert({
      where: {
        userId_friendUserId: {
          userId: DEMO_AUTHOR_USER_ID,
          friendUserId: friendId,
        },
      },
      create: {
        userId: DEMO_AUTHOR_USER_ID,
        friendUserId: friendId,
        status: 'accepted',
      },
      update: { status: 'accepted' },
    })
  }

  console.info(
    `[seed] Demo author: /user/${DEMO_AUTHOR_USER_ID} · login ${DEMO_AUTHOR_USERNAME} / ${DEMO_AUTHOR_PASSWORD_PLAIN} · ${DEMO_AUTHOR_FRIEND_IDS.length} amigos (fixture)`,
  )
}
