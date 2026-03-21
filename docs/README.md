# Documentação do projeto (baseline arquitetural)

**Produto (nome provisório):** Gwan Social Reputation  
**Versão da baseline:** 2.1  
**Última revisão:** 2026-03-21  
**URL base (produção — SPA web):** https://social.gwan.com.br/  
**Escopo:** governança, arquitetura (visão inspirada em domínios TOGAF), padrões de entrega e integração entre `api-node` (NestJS), `worker-python` (FastAPI + workers), `web` (React), `mobile` (React Native), PostgreSQL e Redis.

## Estado da implementação (snapshot)

**As-is no repositório:** apenas **`apps/web`** está implementada como SPA (React + Vite), com **dados e autenticação mock** (`localStorage`), sem `api-node`, `worker-python`, PostgreSQL ou Redis em execução.

**Docker atual:** build estático da web + **Nginx** — [docker-compose.yml](../docker-compose.yml) (porta local) e [docker-compose-production.yml](../docker-compose-production.yml) (Traefik / rede externa `gwan`). Não substitui o alvo M1 de Compose com API, worker e bases de dados.

A visão alvo (monorepo completo, integração `/v1`, filas) mantém-se nos documentos de visão e entrega; ver [04-application-architecture/application-components.md](04-application-architecture/application-components.md) e [06-delivery/project-tasks.md](06-delivery/project-tasks.md).

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
| Dados | [03-data-architecture](03-data-architecture/) | Domínio, entidades, ciclo de vida |
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

**Estrutura:** hoje existem `apps/web` e pastas sob `docker/` + ficheiros Compose na raiz. Estrutura alvo completa (`apps/api-node`, `apps/worker-python`, `apps/mobile`, `packages/*`, `infra/docker` ou consolidação do Compose) em [07-standards/folder-structure.md](07-standards/folder-structure.md).

**Web (dev):** na raiz, `npm install` e `npm run dev:web`.
