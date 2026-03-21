# Schema físico PostgreSQL (API)

## Objetivo

Documentar o **modelo relacional** aplicado na API (`apps/api`) via **Prisma**, espelhando o domínio dos fixtures [`gwan-social.fixtures.json`](../../apps/web/src/data/fixtures/gwan-social.fixtures.json) (`schemaVersion` 2). O diagrama conceitual de negócio continua em [domain-model.md](domain-model.md); este ficheiro descreve **tabelas e FKs** reais.

## Ligação

- Variável de ambiente **`DATABASE_URL`** (PostgreSQL), definida em `apps/api/.env` (não commitado). Ver [`apps/api/.env.example`](../../apps/api/.env.example).
- Migrations versionadas em [`apps/api/prisma/migrations/`](../../apps/api/prisma/migrations/).
- Schema Prisma: [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma).
- **Seeders (código):** [`apps/api/prisma/seeds/`](../../apps/api/prisma/seeds/) — módulos por tabela (`seedUsers`, `seedPosts`, …) e [`runAllSeeds.ts`](../../apps/api/prisma/seeds/runAllSeeds.ts); a entrada [`prisma/seed.ts`](../../apps/api/prisma/seed.ts) só orquestra. A fonte de dados é o mesmo **`gwan-social.fixtures.json`** que alimenta o mock da API (`FIXTURES_PATH` opcional). Após o fixture, [`seedDemoAuthorWithPosts.ts`](../../apps/api/prisma/seeds/seedDemoAuthorWithPosts.ts) cria um utilizador **só na base** com duas postagens e **amizades aceites** com `user_001`…`user_005` do fixture (login **`gwanseed_posts`** / **`DemoPosts123!`**, ver ficheiro para o UUID do perfil).

## Comandos (na pasta `apps/api`)

| Comando | Descrição |
|--------|-----------|
| `npx prisma migrate deploy` | Aplica migrations pendentes (CI / produção). |
| `npx prisma migrate dev` | Cria/aplica migrations em desenvolvimento. |
| `npm run prisma:seed` | Executa [`prisma/seed.ts`](../../apps/api/prisma/seed.ts) → [`seeds/runAllSeeds.ts`](../../apps/api/prisma/seeds/runAllSeeds.ts) (idempotente; `FIXTURES_PATH` opcional). |
| `npm run prisma:studio` | UI de inspeção dos dados. |

A API Nest continua a servir leitura a partir dos **fixtures hidratados** até os casos de uso passarem a usar `PrismaService`; o seed povoa a base para desenvolvimento e testes futuros.

**Autenticação:** a migration `20260221120000_add_auth` acrescenta `users.email`, `users.password_hash` (nullable para contas só do seed) e a tabela `refresh_tokens` (refresh com revogação). Ver rotas em [`docs/07-standards/api-standards.md`](../07-standards/api-standards.md).

## Diagrama ER (físico)

```mermaid
erDiagram
  users ||--o{ posts : "author_id"
  users ||--o{ comments : "author_id"
  users ||--o{ ratings : "reviewer_id"
  users ||--o{ ratings : "reviewee_id"
  users ||--o{ friendships : "user_id"
  users ||--o{ friendships : "friend_user_id"
  users ||--o{ post_mentions : "user_id"
  users ||--o{ refresh_tokens : "user_id"
  posts ||--o{ post_media : "post_id"
  posts ||--o{ comments : "post_id"
  posts ||--o{ ratings : "post_id"
  posts ||--o{ post_mentions : "post_id"

  users {
    text id PK
    text username UK
    text email UK_nullable
    text display_name
    text avatar_url
    text headline
    text bio_nullable
    text password_hash_nullable
    timestamp created_at
    timestamp updated_at
  }

  refresh_tokens {
    text id PK
    text user_id FK
    text token_hash
    timestamp expires_at
    timestamp created_at
    timestamp revoked_at_nullable
  }

  posts {
    text id PK
    text author_id FK
    text type
    text title
    text description
    timestamp created_at
    text visibility
    text category
    jsonb location
    jsonb tags
    boolean is_trending
    boolean is_highest_rated
  }

  post_media {
    text id PK
    text post_id FK
    text type
    text url
    text alt
    int position
  }

  comments {
    text id PK
    text post_id FK
    text author_id FK
    text text
    timestamp created_at
  }

  ratings {
    text id PK
    text reviewer_id FK
    text reviewee_id FK
    text post_id FK
    int value
    text comment
    timestamp created_at
    text context_type
    text interaction_id
  }

  friendships {
    text user_id PK_FK
    text friend_user_id PK_FK
    text status
  }

  post_mentions {
    text post_id PK_FK
    text user_id PK_FK
  }
```

## Mudanças

Alterações estruturais: nova migration Prisma + atualizar este documento e [data-entities.md](data-entities.md).
