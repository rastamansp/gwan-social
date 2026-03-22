# Gwan Social Reputation

<p align="center">
  <img src="./docs/assets/cover-gwan-social.png" alt="Capa Gwan Social" width="100%" />
</p>

<p align="center">
  Plataforma experimental de <strong>reputação social contextual</strong>, inspirada em <strong>Nosedive</strong> (<em>Black Mirror</em>).
</p>

<p align="center">
  <strong>URL base (produção):</strong>
  <a href="https://social.gwan.com.br/">https://social.gwan.com.br/</a>
</p>

<p align="center">
  <a href="#visao-geral">Visão geral</a> ·
  <a href="#inspiracao">Inspiração</a> ·
  <a href="#screenshots">Screenshots</a> ·
  <a href="#funcionalidades-atuais">Funcionalidades</a> ·
  <a href="#stack">Stack</a> ·
  <a href="#como-executar">Como executar</a> ·
  <a href="#api-nest">API Nest</a> ·
  <a href="#estrutura-do-monorepo">Estrutura</a> ·
  <a href="#roadmap">Roadmap</a>
</p>

---

<a id="visao-geral"></a>

## Visão geral

**Gwan Social Reputation** explora **reputação por contexto** — não uma “nota social única” que define o valor de uma pessoa. A ideia é considerar dimensões diferentes de interação (convivência, confiança em transações, colaboração, comunidade, etc.) e evoluir para regras de negócio rastreáveis.

O repositório é um **monorepo** com **app web** (React + Vite) e **API Nest** (`apps/api`) sobre **PostgreSQL**. A SPA espera **`VITE_API_URL`** apontando para **`/api/v1`** (ex.: `http://localhost:4000/api/v1`); sem isso, os ecrãs sociais mostram instruções para configurar a API. A instância pública alvo está em **https://social.gwan.com.br/** (meta tags Open Graph em `apps/web/index.html`).

O projeto serve para estudar:

- design de produtos sociais e confiança digital
- arquitetura em monorepo e evolução para backend transacional
- frontend moderno (React 19, Tailwind v4)
- direção futura: Node/NestJS, processamento assíncrono, mobile

> **Regra-alvo do produto:** em versões futuras, **só será possível avaliar outra pessoa após uma interação registrada**, reduzindo fraude e aumentando o significado da reputação. No MVP atual, a autenticação e os votos são **locais (demonstração)**.

Documentação arquitetural e de governança: [`docs/README.md`](docs/README.md).

### Ficheiro `gwan-social.fixtures.json` (seed / tooling)

O JSON em [`apps/web/src/data/fixtures/gwan-social.fixtures.json`](apps/web/src/data/fixtures/gwan-social.fixtures.json) (`schemaVersion` 2) é **fonte opcional** do **`prisma seed`** na API (`FIXTURES_PATH` ou caminho por omissão em `apps/api/prisma/seeds`). **Não** é carregado pela SPA nem pela API em runtime.

- Script **`npm run emit:fixtures --workspace=web`**: migra JSON legado v1 → v2 (usa [`hydrateFixtures.ts`](apps/web/src/data/fixtures/hydrateFixtures.ts) só neste fluxo).
- UI: imagens de fallback e textos estáticos passaram para [`apps/web/src/data/ui-constants.ts`](apps/web/src/data/ui-constants.ts).

---

<a id="inspiracao"></a>

## Inspiração

A referência principal é o episódio **Nosedive**, de *Black Mirror*, onde interações sociais moldam status e oportunidades.

O **Gwan Social** usa isso como gancho, não como cópia: foco em **reputação contextual**, **rastreabilidade**, mitigação de abuso e desenho de produto aplicável a comunidades, eventos e serviços reais.

---

<a id="screenshots"></a>

## Screenshots

> Adicione os arquivos em [`docs/assets/`](docs/assets/README.md) quando tiver capa e capturas (prints do browser, Figma ou mockups).

### Tela inicial / feed

![Feed principal](./docs/assets/screenshot-home.png)

**Descrição:** feed editorial com cartões estilo *Nosedive*, votação por estrelas (demonstração no cliente) e navegação para o detalhe. Dados: **`GET /api/v1/feed`** com **`VITE_API_URL`** (ver [integração SPA ↔ API](#integracao-spa-api)).

### Meu perfil

![Meu perfil](./docs/assets/screenshot-profile.png)

**Descrição:** aba **Meu perfil** (`?tab=profile`) com layout tipo rede social + sidebar de reputação (requer sessão; conta demo disponível).

### Pessoas e ranking

![Ranking](./docs/assets/screenshot-ranking.png)

**Descrição:** **Pessoas** e **Ranking** derivam dos **autores do feed** (`GET /feed`) — não há listagem global `GET /users`; ver [integração](#integracao-spa-api).

### Detalhe da postagem

![Detalhe da postagem](./docs/assets/screenshot-post.png)

**Descrição:** página `/post/:id` com galeria, comentários e votação (dados via **`GET /posts/:id`** com API configurada).

---

<a id="funcionalidades-atuais"></a>

## Funcionalidades atuais (MVP front-end)

- **Navegação principal** (`/`): abas **Feed**, **Meu perfil**, **Pessoas** e **Ranking** via `?tab=`; a aba perfil exige usuário autenticado (senão volta ao feed).
- **Feed editorial** (`FeedPostList`): posts ricos, cartão social embutido, link para `/post/:postId`, feedback de voto local.
- **Próximo** (`/nearby`): **`GET /posts/nearby`** (distância placeholder na API até haver geo real); atalho na barra.
- **Detalhe de post** (`/post/:postId`): layout editorial; dados **`GET /posts/:id`**; estrelas com estado local (demonstração).
- **Perfil público** (`/user/:userId`): momentos e separadores via endpoints de utilizador na API.
- **Criar postagem** (`/user/create-post`): assistente `content` → `media` → `review`; **`POST /me/posts`** (multipart; MinIO se configurado).
- **Editar perfil** (`/user/:userId/edit`): **`PATCH /me`** alinhado à sessão.
- **Dados HTTP:** com **`VITE_API_URL`** (ex.: `http://localhost:4000/api/v1`), feed, post, próximo, perfil, pessoas/ranking (a partir do feed) e **`GET /me`** usam a API; sem variável, mensagens pedem configurar a variável — **sem fixtures em bundle**.
- **Autenticação:** `/login` e `/register` contra **`/auth/*`** quando a API está configurada; tokens em `localStorage`; conta **`demo` / `demo123`** se existir na base (seed).
- **Sessão e perfil “eu”:** `SessionUserContext` + `AuthContext` para alinhar UI ao usuário autenticado.
- **Landing institucional** (`/presentation`) fora do shell principal da app.
- **404** dedicada para rotas desconhecidas dentro da app.
- **Redirecionamento** `/home` → `/`.

---

<a id="stack"></a>

## Stack

### Web (este repositório)

- **Vite 6**
- **React 19**
- **React Router 7**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Lucide**, **clsx**, **tailwind-merge**
- **ESLint** (flat config)

### Direção arquitetural (visão do projeto)

- Backend: **Node.js / NestJS**
- Processamento pesado / filas: **Python** (ex.: FastAPI, Celery)
- Mobile: **React Native**
- Dados: **PostgreSQL**, **Redis** (cache / broker)

Padrões: monorepo, separação por módulos, evolução em direção a casos de uso explícitos — alinhado à documentação em `docs/`.

---

<a id="como-executar"></a>

## Como executar

### Com Docker (produção local)

Pré-requisitos: [Docker](https://docs.docker.com/get-docker/) e Docker Compose v2.

Na **raiz do repositório**:

```bash
docker compose up --build
```

- Interface: **http://localhost:8080** (porta do host mapeada para o Nginx no **container**).
- Outra porta: `WEB_PORT=3000 docker compose up --build`.

O fluxo faz **build de produção** da web e serve arquivos estáticos com **Nginx** e *fallback* SPA (`try_files` → `index.html`).

Parar: `Ctrl+C` ou `docker compose down`.

| Arquivo | Função |
|---------|--------|
| [`docker-compose.yml`](docker-compose.yml) | Serviço `web`, mapeamento de portas |
| [`apps/api/docker-compose.yml`](apps/api/docker-compose.yml) | Serviço `api` (NestJS + PostgreSQL) |
| [`docker-compose-production.yml`](docker-compose-production.yml) | Produção com Traefik (rede externa `gwan`) |
| [`docker/Dockerfile`](docker/Dockerfile) | Multi-stage: dependências → build Vite → Nginx |
| [`docker/Dockerfile.api`](docker/Dockerfile.api) | Multi-stage: `npm ci` workspaces → build `apps/api` → Node |
| [`docker/nginx/default.conf`](docker/nginx/default.conf) | SPA, gzip, `/health` |
| [`.dockerignore`](.dockerignore) | Contexto de build |
| [`.env.example`](.env.example) | Variáveis para compose de produção |

> O `docker compose` acima entrega a **build de produção**. Para hot-reload, usa Node em local (secção seguinte).

#### Produção com Traefik

```bash
docker network create gwan   # uma vez, se ainda não existir
cp .env.example .env         # opcional: ajustar GWAN_SOCIAL_HOST e VITE_*
docker compose -f docker-compose-production.yml up --build -d
```

- **`GWAN_SOCIAL_HOST`**: domínio na regra Traefik `Host(\`…\`)`; omissão: `social.gwan.com.br`. URL pública completa: **https://social.gwan.com.br/**.
- **`VITE_*`**: definir no `.env` **antes** do build — variáveis de **build-time** do Vite. Para apontar à API Nest em dev, usar por exemplo **`VITE_API_URL=http://localhost:4000/api/v1`** (omissão no compose de produção alinhada em [`docker-compose-production.yml`](docker-compose-production.yml) / [`docker/Dockerfile`](docker/Dockerfile)).

#### Checklist antes de subir (produção)

1. **Rede Traefik:** `docker network create gwan` (se ainda não existir) e labels/entrypoints alinhados ao vosso Traefik (`websecure`, `letsencrypt`, etc.).
2. **`.env` na raiz:** copiar de [`.env.example`](.env.example); definir **`GWAN_SOCIAL_HOST`** e **`VITE_API_URL`** com a URL **HTTPS** pública da API **antes** de `docker compose -f docker-compose-production.yml build` (ex.: `https://api.seudominio.com/api/v1` — o bundle embute este valor; localhost no default do compose só serve para builds sem API pública).
3. **API (`apps/api`) em separado:** serviço com `DATABASE_URL`, **`JWT_SECRET`** (mín. 32 caracteres em produção), **`CORS_ORIGINS`** incluindo a origem da SPA (ex.: `https://social.gwan.com.br`). Executar **`npx prisma migrate deploy`** (e seed se aplicável) no ambiente alvo antes de aceitar tráfego.
4. **Segredos:** nunca commitar `.env` com credenciais; usar vault ou variáveis do orquestrador em produção.

O compose de produção na raiz **só** publica a **SPA estática**; a API Nest não faz parte desse ficheiro — ver [`docs/05-technology-architecture/deployment-view.md`](docs/05-technology-architecture/deployment-view.md).

### Desenvolvimento local (Node)

Requisitos: **Node.js 20+** (recomendado **22**), **npm 10+**.

```bash
npm install
npm run dev:web
```

Abre o endereço que o Vite indicar (geralmente **http://localhost:5173**).

<a id="integracao-spa-api"></a>

#### Integração SPA ↔ API

- Copiar [`apps/web/.env.example`](apps/web/.env.example) para **`apps/web/.env`** e definir **`VITE_API_URL=http://localhost:4000/api/v1`** — URL **completa** até `/api/v1`.
- Com **`VITE_API_URL` vazia ou ausente**, os ecrãs sociais mostram aviso para configurar a API (sem dados mock em JSON).
- Com a variável e **`npm run dev:api`**, feed, post, próximo, perfis e sessão usam **`/api/v1`**; falhas de rede mostram erro conforme cada ecrã.
- **CORS:** origem do Vite em **`CORS_ORIGINS`** — ver [`apps/api/docker-compose.yml`](apps/api/docker-compose.yml).
- **Pessoas e Ranking:** listas derivadas dos autores do **`GET /feed`** (sem `GET /users` global).

Build local da web:

```bash
npm run build:web
```

Detalhes da pasta `apps/web`: [**apps/web/README.md**](apps/web/README.md).

<a id="api-nest"></a>

### API Nest (NestJS + PostgreSQL)

A app **`apps/api`** usa **NestJS** e **Prisma/PostgreSQL** para feed, utilizadores, posts, auth JWT, etc. O JSON [`gwan-social.fixtures.json`](apps/web/src/data/fixtures/gwan-social.fixtures.json) serve apenas para **`prisma seed`** (opcional).

```bash
npm install
npm run dev:api
```

- **Dev:** `nest start --watch` (via script `dev` do workspace).

- **Arquitectura (resumo):** `presentation/http/v1`, `application` (casos de uso, mappers, paginação), `infrastructure/prisma` (+ storage público quando aplicável).

- **URL base:** `http://localhost:4000` (override com `PORT` no ambiente).
- **Swagger UI:** **`/api/`** (`/api` redireciona com barra final para os assets). Ex.: [http://localhost:4000/api/](http://localhost:4000/api/). Com o Vite a correr, [http://localhost:5173/api/](http://localhost:5173/api/) também funciona (*proxy* inclui `/api/v1`, `/api/openapi.json` e o UI) — é preciso **`npm run dev:api`** noutro terminal.
- **OpenAPI JSON:** **`/api/openapi.json`** — documento gerado pelo `@nestjs/swagger` (codegen, Postman, etc.).
- **Prefixo REST:** `/api/v1` (ex.: `GET /api/v1/health`, `GET /api/v1/feed?limit=5&cursor=…`).
- **CORS:** por defeito **`http://localhost:5173`** e **`127.0.0.1:5173`**; em Docker usa-se **`CORS_ORIGINS`** (vírgulas). Ver [`apps/api/docker-compose.yml`](apps/api/docker-compose.yml).
- **`PUBLIC_API_URL`:** opcional; ajusta o campo `servers` no OpenAPI e os links JSON da rota `GET /` (útil atrás de proxy ou outra porta publicada).
- **Seed (fixtures JSON):** opcional via **`FIXTURES_PATH`** ou caminho por omissão para o JSON da web — ver [`apps/api/.env.example`](apps/api/.env.example).
- **PostgreSQL (Prisma):** **`DATABASE_URL`**, `npm run prisma:migrate` e `npm run prisma:seed` em **`apps/api`** — [database-schema-physical.md](docs/03-data-architecture/database-schema-physical.md).
- **Autenticação (JWT):** `POST /api/v1/auth/register|login|refresh|logout`; **`GET /api/v1/me`** exige **`Authorization: Bearer`**. Com **`VITE_API_URL`**, a web guarda tokens em `localStorage` — [api-standards.md](docs/07-standards/api-standards.md).

Build da API:

```bash
npm run build:api
npm run start --workspace=api
```

#### API com Docker Compose

Na **raiz do repositório**:

```bash
docker compose -f apps/api/docker-compose.yml up --build
```

- **URL:** `http://localhost:4000` (mapear outra porta com `API_PORT=3001 docker compose -f apps/api/docker-compose.yml up --build`).
- **CORS:** variável `CORS_ORIGINS` (lista separada por vírgulas); o compose define por defeito Vite (`5173`) e Nginx local da web (`8080`).
- **Imagem:** [`docker/Dockerfile.api`](docker/Dockerfile.api) — build da API; `DATABASE_URL` e segredos via ambiente do compose.

---

<a id="estrutura-do-monorepo"></a>

## Estrutura do monorepo

```
.
├── apps/
│   ├── api/                 # NestJS + Prisma / PostgreSQL
│   └── web/                 # aplicação React + Vite
├── docker/                  # Dockerfile web, Dockerfile.api, Nginx
├── docs/                    # arquitetura, governança, assets do README
├── packages/                # pacotes compartilhados (futuro)
├── docker-compose.yml
├── docker-compose-production.yml
└── README.md
```

### Pastas principais da web (`apps/web/src`)

```
pages/          # Index, Post, Nearby, Login, Register, EditProfile, wizard create-post, …
components/     # layout, profile, social (NavBar, FeedPostList, Leaderboard, …)
contexts/       # Auth, sessão, rascunho de post
data/           # tipos DTO, adapters, ui-constants; fixtures JSON só seed/tooling
lib/            # navegação, ranking, utilitários
```

---

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Feed (`?tab=feed`), **Meu perfil** (`?tab=profile`, autenticado), **Pessoas**, **Ranking** com `?tab=ranking&rank=` (`reputation`, `volume`, `tier`, `engagement`) |
| `/login` | Entrada (conta demo `demo` / `demo123`) |
| `/register` | Registo via API (`POST /auth/register`) |
| `/nearby` | `GET /api/v1/posts/nearby` (requer API + sessão) |
| `/post/:postId` | `GET /api/v1/posts/:postId` |
| `/user/:userId` | Perfil público (endpoints de utilizador) |
| `/user/:userId/edit` | Editar perfil (`PATCH /me`) |
| `/user/create-post` | Wizard: `content`, `media`, `review` (conta autenticada) |
| `/presentation` | Landing fora do AppShell |
| `/home` | Redireciona para `/` |
| `*` | 404 |

---

## Documentação

- [`docs/README.md`](docs/README.md) — índice arquitetural
- [`apps/web/README.md`](apps/web/README.md) — SPA, rotas, organização do código
- [`docs/07-standards/coding-standards.md`](docs/07-standards/coding-standards.md)
- [`.cursorrules`](.cursorrules) — convenções para assistentes / equipa

---

<a id="roadmap"></a>

## Roadmap

### MVP (front)

- [x] Monorepo e app web React
- [x] Feed editorial, ranking, pessoas, detalhe de post
- [x] Abas principais na home (`feed`, `profile`, `pessoas`, `ranking`)
- [x] Login / cadastro / sessão local (demonstração)
- [x] Editar perfil e wizard de nova postagem (API)
- [x] Docker local + compose de produção (Traefik, variáveis `.env`)
- [x] API Nest + PostgreSQL (Prisma): feed, posts, perfis, seed opcional a partir do JSON; JWT (`/auth/*`, `/me`)
- [ ] Interações registadas como pré-condição para avaliações; pipeline de reputação assíncrona e cálculo contextual no backend

### Próximas evoluções

- [ ] Endpoints adicionais (ex.: diretório global de utilizadores, trending server-side)
- [ ] Workers Python para processamento pesado
- [ ] Moderação e antifraude
- [ ] Eventos de domínio
- [ ] Tempo real (WebSocket)
- [ ] App mobile (React Native)

---

## Sobre este projeto

Experimento de produto e arquitetura: partir de ficção especulativa e construir algo discutível tecnicamente — regras de negócio, UX de reputação e base para evoluir em público.

---

## Contribuição

Fase inicial: sugestões de arquitetura, UX, reputação contextual, antifraude e organização do monorepo são bem-vindas.

---

## Status

**Em construção** — fundação do projeto e evolução pública do MVP.

---

## Licença

A definir.
