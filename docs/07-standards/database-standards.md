# Padrões de banco de dados (PostgreSQL)

## Objetivo

Normas para **migrations**, **naming**, **índices** e **consistência** entre API e worker.

## Migrations

- Na API Node, as **migrations PostgreSQL** são geridas com **Prisma** (`apps/api/prisma/migrations`, ver [database-schema-physical.md](../03-data-architecture/database-schema-physical.md)). Evitar uma segunda ferramenta de schema para o mesmo runtime (ex.: Alembic só entra se o schema for escrito noutro serviço).  
- Toda PR com mudança de schema inclui migration **revisável** e atualização de [data-entities.md](../03-data-architecture/data-entities.md) e do diagrama em [database-schema-physical.md](../03-data-architecture/database-schema-physical.md) quando aplicável.

## Naming

- Tabelas: `snake_case` plural.  
- Colunas: `snake_case`.  
- FKs: `fk_<tabela>_<referencia>`.

## Soft delete

- Opcional por entidade; se usado, coluna `deleted_at` e índices parciais conforme consultas.

## Índices

- Criar para FKs e filtros de listagem; evitar over-indexing antes de métricas.

## Transação + fila (outbox)

- **Padrão recomendado** quando gravar fato **e** publicar evento: **transactional outbox** (tabela `outbox` + processo que envia à Redis).  
- **Trade-off:** mais complexidade vs perda de mensagens. Alternativa: aceitar retry duplicado no worker com idempotência.

## Seeds

- Apenas **dados não sensíveis** para dev; nunca PII real.
