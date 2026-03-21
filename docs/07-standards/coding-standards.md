# Padrões de codificação

## Objetivo

Convenções **mínimas** para NestJS, Python, React e React Native no monorepo **gwan-social**, alinhadas a Clean Architecture e aos [princípios de arquitetura](../00-governance/architecture-principles.md).

## NestJS (`apps/api-node`)

- **Módulos por capacidade** (`identity`, `profile`, `interaction`, `rating`, `reputation`).  
- **Camadas por feature:**  
  - `domain/` — entidades, value objects, interfaces de repositório  
  - `application/` — casos de uso (classes `*UseCase` ou `*Service` de aplicação)  
  - `infrastructure/` — TypeORM/Prisma/adapters, publicadores de fila  
  - `presentation/` ou `interfaces/http/` — controllers finos  
- **Controllers:** validação de entrada (DTO + `class-validator` ou Zod via pipe), chamada a **um** caso de uso, mapeamento de status HTTP.  
- **Nomenclatura:** `CreateRatingUseCase`, `RatingController`, `PostgresRatingRepository`.

## Python (`apps/worker-python`)

- **Camadas:** `domain`, `application` (handlers de job), `infrastructure` (DB Redis), `api` (FastAPI mínimo para health).  
- **Workers:** funções puras onde possível; efeitos colaterais em adaptadores.  
- **Nomenclatura:** `recalculate_reputation_handler`, `reputation_repository`.

## React (`apps/web`)

- **Containers** (hooks, dados) vs **componentes** de apresentação.  
- Chamadas HTTP via cliente centralizado; tipos de [shared-types](../../packages/shared-types) (quando existir).  
- **Proibido:** calcular score de reputação no cliente além de formatação.

## React Native (`apps/mobile`)

- Mesmas regras do React; navegação e UI nativa não contêm regra de domínio.

## Estilo e qualidade

- Formatter/linter (Prettier, ESLint, Ruff/black) — configurar na ETAPA 2.  
- **Testes unitários:** fora do escopo inicial; quando introduzidos, exigir ADR ou atualização deste documento.

## Commits e PRs

- Referenciar UC-ID e issue; mencionar ADR se aplicável.
