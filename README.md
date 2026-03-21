# Gwan Social Reputation

<p align="center">
  <img src="./docs/assets/cover-gwan-social.png" alt="Capa Gwan Social" width="100%" />
</p>

<p align="center">
  Plataforma experimental de <strong>reputação social contextual</strong>, inspirada em <strong>Nosedive</strong> (<em>Black Mirror</em>).
</p>

<p align="center">
  <a href="#visao-geral">Visão geral</a> ·
  <a href="#inspiracao">Inspiração</a> ·
  <a href="#screenshots">Screenshots</a> ·
  <a href="#funcionalidades-atuais">Funcionalidades</a> ·
  <a href="#stack">Stack</a> ·
  <a href="#como-executar">Como executar</a> ·
  <a href="#estrutura-do-monorepo">Estrutura</a> ·
  <a href="#roadmap">Roadmap</a>
</p>

---

<a id="visao-geral"></a>

## Visão geral

**Gwan Social Reputation** explora **reputação por contexto** — não uma “nota social única” que define o valor de uma pessoa. A ideia é considerar dimensões diferentes de interação (convivência, confiança em transações, colaboração, comunidade, etc.) e evoluir para regras de negócio rastreáveis.

O repositório é um **monorepo**; o que roda hoje é a **app web** (React + Vite), com **dados mock** para demonstrar fluxos de produto e UI.

O projeto serve para estudar:

- design de produtos sociais e confiança digital
- arquitetura em monorepo e evolução para backend transacional
- frontend moderno (React 19, Tailwind v4)
- direção futura: Node/NestJS, processamento assíncrono, mobile

> **Regra-alvo do produto:** em versões futuras, **só será possível avaliar outra pessoa após uma interação registrada**, reduzindo fraude e aumentando o significado da reputação. No MVP atual, a autenticação e os votos são **locais (demonstração)**.

Documentação arquitetural e de governança: [`docs/README.md`](docs/README.md).

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

**Descrição:** feed editorial com cartões estilo *Nosedive*, votação por estrelas (mock) e navegação para o detalhe da postagem.

### Meu perfil

![Meu perfil](./docs/assets/screenshot-profile.png)

**Descrição:** aba **Meu perfil** (`?tab=profile`) com layout tipo rede social + sidebar de reputação (requer sessão; conta demo disponível).

### Pessoas e ranking

![Ranking](./docs/assets/screenshot-ranking.png)

**Descrição:** lista de **Pessoas** e **Ranking** com critérios (`reputação`, `volume`, `tier`, `engajamento`).

### Detalhe da postagem

![Detalhe da postagem](./docs/assets/screenshot-post.png)

**Descrição:** página `/post/:id` com galeria, comentários e votação (mock).

---

<a id="funcionalidades-atuais"></a>

## Funcionalidades atuais (MVP front-end)

- **Navegação principal** (`/`): abas **Feed**, **Meu perfil**, **Pessoas** e **Ranking** via `?tab=`; a aba perfil exige usuário autenticado (senão volta ao feed).
- **Feed editorial** (`FeedPostList`): posts ricos, cartão social embutido, link para `/post/:postId`, feedback de voto local.
- **Próximo** (`/nearby`): experiência de postagens na área (mock + distância); atalho na barra.
- **Detalhe de post** (`/post/:postId`): layout editorial, galeria, comentários e estrelas (estado local).
- **Perfil público** (`/user/:userId`): momentos, métricas e ligações a partir do feed.
- **Criar postagem** (`/user/:userId/create-post`): assistente em passos `content` → `media` → `review` (mock).
- **Editar perfil** (`/user/:userId/edit`): formulário de demonstração ligado ao contexto de sessão.
- **Autenticação local (sem API):** `/login` e `/register` com persistência em `localStorage`; conta de teste **`demo` / `demo123`**; cadastro de novas contas guardado só no browser.
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
| [`docker-compose-production.yml`](docker-compose-production.yml) | Produção com Traefik (rede externa `gwan`) |
| [`docker/Dockerfile`](docker/Dockerfile) | Multi-stage: dependências → build Vite → Nginx |
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

- **`GWAN_SOCIAL_HOST`**: domínio na regra Traefik `Host(\`…\`)`; omissão: `social.gwan.com.br`.
- **`VITE_*`**: definir no `.env` **antes** do build — variáveis de **build-time** do Vite (URL da API futura, nome da app, versão).

### Desenvolvimento local (Node)

Requisitos: **Node.js 20+** (recomendado **22**), **npm 10+**.

```bash
npm install
npm run dev:web
```

Abre o endereço que o Vite indicar (geralmente **http://localhost:5173**).

Build local da web:

```bash
npm run build:web
```

Detalhes da pasta `apps/web`: [**apps/web/README.md**](apps/web/README.md).

---

<a id="estrutura-do-monorepo"></a>

## Estrutura do monorepo

```
.
├── apps/
│   └── web/                 # aplicação React + Vite
├── docker/                  # Dockerfile e Nginx
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
data/           # mocks, tipos, coleção editorial
lib/            # navegação, ranking, utilitários
```

---

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Feed (`?tab=feed`), **Meu perfil** (`?tab=profile`, autenticado), **Pessoas**, **Ranking** com `?tab=ranking&rank=` (`reputation`, `volume`, `tier`, `engagement`) |
| `/login` | Entrada (conta demo `demo` / `demo123`) |
| `/register` | Registo local (mock) |
| `/nearby` | Postagens próximas (mock) |
| `/post/:postId` | Detalhe editorial, estrelas e comentários (mock) |
| `/user/:userId` | Perfil público |
| `/user/:userId/edit` | Editar perfil (mock) |
| `/user/:userId/create-post` | Wizard: `content`, `media`, `review` |
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
- [x] Editar perfil e wizard de nova postagem (mock)
- [x] Docker local + compose de produção (Traefik, variáveis `.env`)
- [ ] API real e persistência (PostgreSQL)
- [ ] Autenticação de servidor
- [ ] Interações registadas como pré-condição para avaliações
- [ ] Cálculo de reputação contextual no backend

### Próximas evoluções

- [ ] Backend NestJS
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
