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
| `/nearby`       | **Próximo** — postagens na área (mock + distância) |
| `/post/:postId` | Detalhe editorial (galeria, estrelas 1–5 e comentários em mock) |
| `/user/:userId` | Perfil público |
| `/user/:userId/edit` | Editar perfil (mock, alinhado à sessão) |
| `/user/:userId/create-post` | Wizard nova postagem: `content` → `media` → `review` |
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
- `src/data/fixtures/gwan-social.fixtures.json` — **seed mock único** (`schemaVersion`, `socialPosts`, `profile`, `sessionDefaultUserId`, `ui`); editar aqui para alterar dados de demonstração ou mapear entidades para backend
- `src/data/fixtures/loadFixtures.ts` — carrega o JSON tipado (`fixtures`)
- `src/data/fixture-types.ts` — tipos partilhados dos fixtures (ex.: `ProfileRatedEntry`)
- `src/data/socialPosts.collection.ts` — `MOCK_SOCIAL_POSTS` a partir do JSON + `orderPostsForFeed`
- `src/data/socialPosts.adapters.ts` — mapeamento para `Post` / `EditorialPost` (UI legada); imagens fallback a partir do JSON
- `src/data/socialPosts.index.ts` — consultas (`getTrendingSocialPosts`, `getFeaturedSocialPost`, …)
- `src/data/legacyFeed.types.ts` — `Post`, `EditorialPost`, `UserProfile` usados pelos componentes
- `src/data/mockUsers.ts` — `posts`, `users`, `editorialByPostId` derivados da coleção social + stats de perfil/sidebar (literais do JSON)
- Alias TypeScript/Vite: `@/` → `src/`

Regras de negócio e chamadas à API: [`docs/07-standards/coding-standards.md`](../../docs/07-standards/coding-standards.md) e [`.cursorrules`](../../.cursorrules).

## Stack

- Vite 6, React 19, React Router, Lucide, clsx, tailwind-merge
- Tailwind CSS 4 (`@import "tailwindcss"` em `src/index.css`) com tokens alinhados ao tema do import + utilitários do frame Nosedive (`bg-nosedive-gradient`, etc.)
