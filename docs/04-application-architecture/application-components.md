# Componentes da aplicação

## Objetivo

Descrever **aplicações**, **pacotes compartilhados** e **bounded contexts lógicos** no monorepo (**npm workspaces** na raiz; **pnpm** opcional), alinhados aos **módulos de produto** em [application-definition.md](../01-architecture-vision/application-definition.md).

## Estado atual vs alvo

| | Estado atual (as-is) | Alvo |
|--|----------------------|------|
| **`apps/web`** | Implementada: UI social com **`VITE_API_URL`** obrigatória para dados sociais; JWT em **`localStorage`** | Worker, filas, mobile — fases M1–M5 |
| **`apps/api`** | **Presente:** NestJS, **PostgreSQL (Prisma)**, JWT, rotas REST **`/api/v1`** | Redis, publicação em fila, worker — fases M1–M5 |
| **`apps/worker-python`**, **`apps/mobile`** | Não existem no repositório | Conforme fases M1–M5 |
| **`packages/shared-types`**, **`packages/shared-utils`** | Opcional / vazio | Contratos e utilitários partilhados |
| **Integração** | SPA ↔ API HTTP + PostgreSQL; sem fila nem worker no repo | API ↔ Redis ↔ worker ↔ PostgreSQL |

## Módulos de produto vs entrega (referência)

| Módulo de produto | Bounded context / entrega principal |
|-------------------|--------------------------------------|
| Identity & Access | Contexto Identity; `apps/api` + DB |
| User Profile | Contexto Profile; `apps/api` + DB |
| Interactions | Contexto Social/interações; `apps/api` + DB |
| Ratings | Contexto Rating; `apps/api` + DB |
| Reputation | Contexto Reputation; `worker-python` (cálculo), `apps/api` (leitura), DB |
| Administration | Superfícies `web` (e APIs com papel admin); evolução futura de políticas |
| Notifications | `apps/api` + canais (evolutivo) |
| Moderation / Appeals | API + worker (futuro) |
| Analytics / Processing | `worker-python`, filas, métricas |

## Mapa de componentes

| Componente | Tecnologia | Responsabilidade principal |
|------------|------------|----------------------------|
| `apps/api` | NestJS | **Hoje:** HTTP sobre **PostgreSQL** (feed, perfis, auth, posts). **Alvo:** filas, worker, regras de reputação assíncronas |
| `apps/worker-python` | FastAPI + workers | Consumo de fila, cálculo de reputação, antifraude/ranking/moderação assíncrona |
| `apps/web` | React | UI web administrativa/social |
| `apps/mobile` | React Native | App mobile consumindo mesma API |
| `packages/shared-types` | TypeScript | Contratos DTO/eventos compartilhados |
| `packages/shared-utils` | TS | Funções puras reutilizáveis (sem I/O) |
| `infra/docker` | Docker Compose | Orquestração local da **stack completa** (alvo M1 — a criar) |
| Raiz: `docker-compose*.yml` + `docker/` | Docker / Nginx | **Implementado:** build estático da web + serviço Nginx; variante produção com Traefik — ver [deployment-view.md](../05-technology-architecture/deployment-view.md) |
| [apps/api/docker-compose.yml](../../apps/api/docker-compose.yml) | Docker | **Implementado:** imagem da API isolada (porta host por omissão **4000**) |

## Bounded contexts (lógicos)

| Contexto | Conteúdo | Fronteira |
|----------|----------|-----------|
| **Identity** | users, sessões/tokens | API + DB |
| **Profile** | perfis | API + DB |
| **Social graph leve** | interactions | API + DB |
| **Rating** | avaliações | API + DB |
| **Reputation** | snapshots, histórico, motor de cálculo | DB + worker; leitura na API |
| **Moderation (futuro)** | reports, appeals | API + worker |

Comunicação **assíncrona** entre API e worker via **Redis** (fila/cache), nunca “import” cruzado de runtime Node/Python.

## Diagrama de dependências (lógico)

```mermaid
flowchart TB
  WEB[apps_web]
  MOB[apps_mobile]
  API[apps_api]
  PY[apps_worker-python]
  ST[packages_shared-types]
  U[packages_shared-utils]
  PG[(PostgreSQL)]
  RD[(Redis)]
  WEB --> API
  MOB --> API
  WEB --> ST
  MOB --> ST
  API --> ST
  API --> PG
  API --> RD
  PY --> PG
  PY --> RD
  API --> U
  WEB --> U
```

**Leitura do diagrama:** representa o **alvo** com integração real. **Hoje**, `apps/api` existe mas **não** liga a PostgreSQL nem Redis; `apps/web` funciona em modo **protótipo** (sem chamadas HTTP efetivas à API nos fluxos principais); `apps_mobile` e `apps_worker-python` ainda não estão no repositório.

## Princípios

- **`apps/api`** não contém algoritmo pesado de reputação — delega ao worker (pode haver validações leves).  
- **worker-python** não expõe regra de negócio em endpoints públicos sem necessidade; foco em jobs e health interno.
