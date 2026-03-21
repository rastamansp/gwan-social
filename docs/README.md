# Documentação do projeto (baseline arquitetural)

**Produto (nome provisório):** Gwan Social Reputation  
**Versão da baseline:** 2.2  
**Última revisão:** 2026-03-21  
**URL base (produção — SPA web):** https://social.gwan.com.br/  
**Escopo:** governança, arquitetura (visão inspirada em domínios TOGAF), padrões de entrega e integração entre **`apps/api`** (NestJS), `worker-python` (FastAPI + workers), `web` (React), `mobile` (React Native), PostgreSQL e Redis.

**Nota de nomenclatura:** documentos mais antigos referiam o componente lógico como `api-node`; a implementação NestJS no monorepo é o workspace **`apps/api`** (nome npm `api`).

## Estado da implementação (snapshot)

**As-is no repositório:**

- **`apps/web`:** SPA (React + Vite), com **dados e autenticação mock** (`localStorage`); **ainda não** consome HTTP da API Nest em fluxos principais.
- **`apps/api`:** NestJS com **read model** a partir de `gwan-social.fixtures.json` (mesma ideia de hidratação que a web), prefixo REST **`/api/v1`**, **Swagger UI** em `/api/`, **OpenAPI JSON** em `/api/openapi.json`. Existe **schema Prisma + migrations** para PostgreSQL e **seed** a partir dos fixtures ([database-schema-physical.md](03-data-architecture/database-schema-physical.md)); os casos de uso HTTP continuam a ler o JSON até migração para repositórios SQL. Sem Redis, filas nem autenticação real.
- **Ainda ausentes:** `apps/worker-python`, `apps/mobile`, stack M1 completa (Compose com Postgres + Redis + worker), `packages/*` alvo.

**Docker atual:** build estático da web + **Nginx** — [docker-compose.yml](../docker-compose.yml) (porta local) e [docker-compose-production.yml](../docker-compose-production.yml) (Traefik / rede externa `gwan`). Existe também [apps/api/docker-compose.yml](../apps/api/docker-compose.yml) para a **API** isolada (porta host por omissão **4000**). Nenhum destes substitui o alvo M1 de Compose unificado com API, worker e bases de dados.

A visão alvo (integração **`/api/v1`** no cliente, filas, persistência) mantém-se nos documentos de visão e entrega; ver [04-application-architecture/application-components.md](04-application-architecture/application-components.md) e [06-delivery/project-tasks.md](06-delivery/project-tasks.md).

## Objetivo desta pasta

Servir como **fonte única de verdade** para:

- decisões arquiteturais e rastreabilidade (objetivo de negócio → caso de uso → dados → tecnologia);
- padrões obrigatórios por release (checklist, ADR quando aplicável);
- alinhamento entre implementação humana/assistida por IA (`.cursorrules` na raiz do repositório).

## Como navegar

| Área | Pasta | Conteúdo principal |
|------|--------|-------------------|
| Governança | [00-governance](00-governance/) | Princípios, modelo de release, checklist, ADR, matriz de rastreabilidade, riscos/premissas, guia das regras do Cursor |
| Visão | [01-architecture-vision](01-architecture-vision/) | Definição funcional do produto, visão técnica e trade-offs |
| Negócio | [02-business-architecture](02-business-architecture/) | Capacidades e processos |
| Dados | [03-data-architecture](03-data-architecture/) | Domínio, entidades, ciclo de vida, [schema físico PostgreSQL / Prisma](03-data-architecture/database-schema-physical.md) |
| Aplicação | [04-application-architecture](04-application-architecture/) | Componentes, casos de uso, integração |
| Tecnologia | [05-technology-architecture](05-technology-architecture/) | Stack, deployment, ambientes |
| Entrega | [06-delivery](06-delivery/) | MVP, Release 1, backlog, roadmap, **[tarefas e progresso](06-delivery/project-tasks.md)** |
| Padrões | [07-standards](07-standards/) | Código, pastas, API, banco, política do `.cursorrules` |
| Comunicação | [08-linkedin](08-linkedin/) | Estratégia de devlog técnico |

## ADRs (Architecture Decision Records)

- **Template:** [00-governance/adr-template.md](00-governance/adr-template.md)  
- **Armazenamento:** [adr/](adr/) — arquivos `NNNN-titulo-curto.md` (ex.: `0001-fila-redis-bullmq.md`)

## Antes de implementar mudanças grandes

1. Ler [01-architecture-vision/application-definition.md](01-architecture-vision/application-definition.md) (escopo, atores, módulos), depois [00-governance/architecture-principles.md](00-governance/architecture-principles.md) e [01-architecture-vision/vision.md](01-architecture-vision/vision.md).  
2. Verificar [04-application-architecture/use-cases.md](04-application-architecture/use-cases.md) e [00-governance/traceability-matrix.md](00-governance/traceability-matrix.md).  
3. Consultar [00-governance/risk-assumptions-constraints.md](00-governance/risk-assumptions-constraints.md) quando a mudança afetar dados, compliance ou integração.  
4. Seguir [00-governance/release-governance-model.md](00-governance/release-governance-model.md) (impacto, ADR, checklist).  
5. Respeitar o [`.cursorrules`](../.cursorrules) na raiz do repositório.

## Monorepo (referência)

**Workspaces atuais:** **npm** na raiz (`package.json` com `workspaces`: `apps/*`, `packages/*`) — ver [README.md](../README.md). Não existe `pnpm-workspace.yaml` no repositório; **pnpm** permanece opcional para adoção futura.

**Estrutura:** hoje existem **`apps/web`**, **`apps/api`**, pastas sob `docker/` + ficheiros Compose na raiz. Estrutura alvo completa (`apps/worker-python`, `apps/mobile`, `packages/*`, `infra/docker` ou consolidação do Compose M1) em [07-standards/folder-structure.md](07-standards/folder-structure.md).

**Web (dev):** na raiz, `npm install` e `npm run dev:web`. **API (dev):** `npm run dev:api` — ver [README.md](../README.md) (secção API de dados fake).
