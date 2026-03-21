# Padrões de banco de dados (PostgreSQL)

## Objetivo

Normas para **migrations**, **naming**, **índices** e **consistência** entre API e worker.

## Migrations

- Ferramenta única por runtime (ex.: TypeORM migrations no Node, ou Alembic no Python) — **evitar** duas fontes de verdade; preferir **migrations lideradas pelo `api-node`** se o schema for majoritariamente escrito pela API.  
- Toda PR com mudança de schema inclui migration **revisável** e atualização de [data-entities.md](../03-data-architecture/data-entities.md).

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
