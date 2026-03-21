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
│   └── nginx/
├── apps/
│   └── web/                     # único app presente: Vite + React + TS + Tailwind
├── packages/                    # vazio ou futuro código partilhado
└── docs/
    ├── assets/                  # imagens README (opcional)
    └── …                       # baseline TOGAF
```

**Alvo (M1/M5, ainda não no repo):** `apps/api-node`, `apps/worker-python`, `apps/mobile`, `packages/shared-types`, `packages/shared-utils`, `infra/docker/` com Compose da stack completa. A **localização final** desse Compose será consolidada na **M1** (evolução dos ficheiros na raiz ou pasta `infra/docker/`).

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

## `apps/api-node` (NestJS — exemplo)

```
apps/api-node/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── modules/
│   │   └── rating/
│   │       ├── domain/
│   │       ├── application/
│   │       ├── infrastructure/
│   │       └── presentation/   # ou interfaces/http/
│   └── shared/
├── package.json
└── tsconfig.json
```

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

- Compose com **PostgreSQL**, **Redis**, `api-node`, `worker-python` e, se aplicável, serviço `web` em dev — **a criar** na ETAPA 3.  
- Hoje o build e serviço web em Docker estão na **raiz** (`docker-compose.yml`, [docker/](../../docker/)).

## Documentação

- Toda mudança estrutural relevante → atualizar este arquivo + ADR se necessário.
