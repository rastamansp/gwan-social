# Web — Gwan Social Reputation

Interface **React** + **TypeScript** + **Tailwind CSS v4** (plugin Vite `@tailwindcss/vite`).

**URL base (produção):** https://social.gwan.com.br/ — `index.html` inclui meta **Open Graph** / **Twitter Card** e `link rel="canonical"` com esta base para partilhas e SEO.

**Docker (build de produção na raiz do monorepo):** ver [README.md](../../README.md#como-executar).

## Comandos

| Comando        | Descrição                    |
|----------------|------------------------------|
| `npm run dev`  | Servidor de desenvolvimento  |
| `npm run build`| Build de produção            |
| `npm run preview` | Pré-visualizar o build   |
| `npm run lint` | ESLint                       |

Na raiz do monorepo: `npm run dev:web`.

### Integração com a API (`/api/v1`)

**Recomendado:** copiar [`.env.example`](.env.example) para **`.env`** e definir **`VITE_API_URL=http://localhost:4000/api/v1`** (URL completa até `/api/v1`). Com a variável vazia, os ecrãs sociais mostram **`ApiRequiredMessage`** — não há dados mock em JSON. Com a API a correr (`npm run dev:api` na raiz), feed, post, próximo, perfil, **`GET /me`**, **Pessoas** e **Ranking** (autores derivados do **`GET /feed`**) usam HTTP. CORS: origem do Vite em `CORS_ORIGINS` na API. [README do monorepo](../../README.md#integracao-spa-api).

O **feed** usa **`GET /feed`** (PostgreSQL). O wizard **`/user/create-post`** usa **`POST /me/posts`** (multipart); imagens com **MinIO** (`MINIO_*`) quando configurado na API.

## SPA (Single Page Application)

- A app usa **React Router** (`BrowserRouter`): uma única carga de `index.html` e navegação no cliente (sem recarregar a página ao mudar de rota).
- O layout compartilhado [`AppShell`](src/components/layout/AppShell.tsx) envolve o núcleo social: `/`, `/post/:postId`, `/nearby`, `/user/...`, com a mesma **NavBar**. As rotas [`/login`](src/pages/LoginPage.tsx) e [`/register`](src/pages/RegisterPage.tsx) ficam **fora** do shell. A landing [`/presentation`](src/pages/PresentationPage.tsx) também fica fora (sem barra social).
- Em **produção**, o servidor estático deve servir `index.html` para qualquer caminho (fallback), por exemplo Netlify `_redirects` ou equivalente — ver [`public/_redirects`](public/_redirects) (inclui **301** de `/apresentacao` → `/presentation` e `/proximo` → `/nearby`).

## Rotas

| Rota            | Conteúdo |
|-----------------|----------|
| `/`             | **Feed** (`?tab=feed` ou raiz): `FeedPostList` + `SocialPostCard`. **Meu perfil** (`?tab=profile`): `ProfileFeedLayout` (requer sessão). **Pessoas** (`?tab=pessoas`). **Ranking** `?tab=ranking&rank=` (`reputation`, `volume`, `tier`, `engagement`) |
| `/login`        | Entrada; conta demo `demo` / `demo123` (`AuthContext` + `localStorage`) |
| `/register`     | Registo local (mock), contas guardadas no browser |
| `/nearby`       | **Próximo** — `GET posts/nearby` (API + sessão) |
| `/post/:postId` | Detalhe editorial — `GET posts/:id` |
| `/user/:userId` | Perfil público |
| `/user/:userId/edit` | Editar perfil (`PATCH /me`) |
| `/user/create-post` | Wizard nova postagem: `content` → `media` → `review` (conta autenticada) |
| `/presentation` | Landing institucional; **fora** do `AppShell` |
| `/home`         | Redireciona para `/` |
| `*`             | 404 |

## Organização

- `src/pages/` — `IndexPage`, `NearbyPage`, `PostPage`, `LoginPage`, `RegisterPage`, `EditProfilePage`, wizard `create-post`, `NotFoundPage`, `PresentationPage`
- `src/contexts/` — `AuthContext` (sessão mock), `SessionUserContext`, rascunho de post
- `src/components/profile/` — `ProfileFeedLayout` (feed estilo perfil/reputação: stone/neutral, coluna + sidebar), `ProfileFeedSidebar`
- `src/components/social/` — `NavBar`, `FeedPostList`, `ProfileHeader`, `PostCard`, `UserCard`, `Leaderboard`, `StarRating`, e frame editorial: `SocialPostCard`, `UserReputationSidebar`, `VoteStarRow`, `ReputationStars`, `CommentPreviewList`
- `src/components/layout/` — apenas landing `/presentation`
- `src/data/socialPost.types.ts` — tipos da coleção rica (post, autor, ratings, comentários, tags)
- `src/data/fixtures/gwan-social.fixtures.json` — **apenas** para `prisma seed` na API / script `emit:fixtures`; **não** importado pela SPA em runtime
- `src/data/fixtures/hydrateFixtures.ts` — usado pelo script `emit:fixtures` (migração de schema JSON)
- `src/data/fixture-types.ts` — tipos partilhados (ex.: `ProfileRatedEntry` nas respostas de perfil)
- `src/data/ui-constants.ts` — imagens fallback e textos estáticos de UI (sem JSON)
- `src/data/feed-order.ts` — ordenação de `SocialPost` para listagens
- `src/data/socialPosts.adapters.ts` — mapeamento API → `Post` / `EditorialPost` / `UserProfile`
- `src/data/socialPosts.index.ts` — `getRatingSpotlightPeople`, re-export `orderPostsForFeed`
- `src/data/user-profile-ui.ts` — `getTierColor`, `getTierLabel`
- `src/data/legacyFeed.types.ts` — `Post`, `EditorialPost`, `UserProfile`
- `src/hooks/useAuthorProfilesFromFeed.ts` — autores únicos a partir do feed (Pessoas / ranking)
- `src/lib/api/` — `getApiBaseUrl`, cliente `fetch` (`apiGet`), endpoints `/api/v1` e mapeamento de utilizador da API → `UserProfile`
- Alias TypeScript/Vite: `@/` → `src/`

Regras de negócio e chamadas à API: [`docs/07-standards/coding-standards.md`](../../docs/07-standards/coding-standards.md) e [`.cursorrules`](../../.cursorrules).

## Stack

- Vite 6, React 19, React Router, Lucide, clsx, tailwind-merge
- Tailwind CSS 4 (`@import "tailwindcss"` em `src/index.css`) com tokens alinhados ao tema do import + utilitários do frame Nosedive (`bg-nosedive-gradient`, etc.)
