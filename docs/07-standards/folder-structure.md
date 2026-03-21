# Estrutura de pastas (monorepo)

## Objetivo

Definir a **árvore oficial** do repositório: estado **atual** (as-is) e **alvo** (ETAPA 3). Workspaces: **npm** via `package.json` na raiz; `pnpm-workspace.yaml` apenas se **pnpm** for adotado — ver [README.md](../../README.md).

## Raiz (as-is + alvo)

```
/
├── .cursorrules
├── package.json                 # npm workspaces: apps/*, packages/*
├── docker-compose.yml           # web estática + Nginx (local)
├── docker-compose-production.yml # web + Traefik (produção)
├── .env.example                 # GWAN_SOCIAL_HOST, VITE_* (Compose produção)
├── docker/
│   ├── Dockerfile               # build Vite + imagem Nginx
│   ├── Dockerfile.api           # build workspace api (Nest)
│   └── nginx/
├── apps/
│   ├── web/                     # Vite + React + TS + Tailwind
│   └── api/                     # NestJS — API read model fixtures (workspace npm "api")
├── packages/                    # vazio ou futuro código partilhado
└── docs/
    ├── assets/                  # imagens README (opcional)
    └── …                       # baseline TOGAF
```

**Alvo (M1/M5 — parcialmente no repo):** `apps/api` **já existe**; faltam `apps/worker-python`, `apps/mobile`, `packages/shared-types`, `packages/shared-utils`, `infra/docker/` (ou Compose na raiz) com **PostgreSQL + Redis + worker** e integração unificada. A **localização final** desse Compose será consolidada na **M1**.

## `apps/web` (React — atual)

```
apps/web/
├── index.html
├── vite.config.ts
├── package.json
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── pages/              # Index (tabs ?tab=), Post, Nearby, Login, Register, EditProfile, create-post wizard, Presentation, 404
│   ├── components/
│   │   ├── layout/         # AppShell, etc.
│   │   ├── profile/        # ProfileFeedLayout, sidebar, momentos
│   │   └── social/         # NavBar, FeedPostList, Leaderboard, cartões editoriais
│   ├── contexts/           # Auth, sessão, rascunho de post
│   ├── data/               # tipos, adapters; seed único em `fixtures/*.json` (`schemaVersion`)
│   └── lib/                # navegação, ranking, utilitários
└── …
```

## `apps/api` (NestJS — as-is)

Clean Architecture enxuta: controladores finos, casos de uso na aplicação, adaptador de fixtures na infraestrutura.

```
apps/api/
├── src/
│   ├── main.ts                 # bootstrap, CORS, prefixo api/v1, Swagger /api/, openapi.json
│   ├── app.module.ts
│   ├── config.ts
│   ├── presentation/
│   │   └── http/
│   │       ├── http-logging.middleware.ts
│   │       └── v1/             # controllers + ApiV1Module
│   ├── application/
│   │   ├── application.module.ts
│   │   ├── ports/              # FixtureReadModelPort, tokens DI
│   │   ├── use-cases/
│   │   ├── mappers/
│   │   └── shared/             # paginação (cursor)
│   ├── infrastructure/
│   │   ├── infrastructure.module.ts
│   │   └── fixtures/           # hidratação JSON, FixtureReadModelAdapter
│   └── types/
├── package.json                # nome npm: "api"
├── docker-compose.yml          # serviço API isolado (opcional)
├── .env.example
└── tsconfig.json
```

**Evolução alvo (por módulo de domínio):** introduzir pastas por feature (`identity/`, `rating/`, …) com `domain/`, `application/`, `infrastructure/`, `presentation/` quando existir persistência e regras ricas — ver [coding-standards.md](coding-standards.md).

## `apps/worker-python` (exemplo)

```
apps/worker-python/
├── src/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/            # health FastAPI opcional
├── workers/
├── pyproject.toml ou requirements.txt
└── Dockerfile
```

## `packages/shared-types`

```
packages/shared-types/
├── src/
│   ├── events/
│   ├── api/
│   └── index.ts
└── package.json
```

Apenas tipos e, se necessário, constantes de contrato — **sem** lógica de framework.

## `packages/shared-utils`

Funções puras (datas, formatação, validações genéricas) sem acesso a DB/Redis.

## `infra/docker` (alvo M1)

- Compose com **PostgreSQL**, **Redis**, **`apps/api`**, `worker-python` e, se aplicável, serviço `web` em dev — **a criar** na ETAPA 3.  
- Hoje: build e serviço web na **raiz** (`docker-compose.yml`, [docker/](../../docker/)); API isolada em [apps/api/docker-compose.yml](../../apps/api/docker-compose.yml).

## Documentação

- Toda mudança estrutural relevante → atualizar este arquivo + ADR se necessário.
