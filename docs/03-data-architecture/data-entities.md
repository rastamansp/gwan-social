# Entidades e persistência (PostgreSQL)

## Objetivo

Listar **tabelas/conceitos** principais, relacionamentos e separação entre **dados operacionais** e **projeções de reputação**, servindo de guia para migrations e revisões de release.

**Schema físico (PostgreSQL + Prisma, diagrama ER):** [database-schema-physical.md](database-schema-physical.md).

## Convenções

- Nomes em `snake_case` plural onde fizer sentido (`users`, `ratings`).  
- Chaves: `uuid` ou `bigint` — **decisão de tipo** na ETAPA 2 com ADR se houver trade-off relevante.  
- Timestamps: `created_at`, `updated_at` onde aplicável.

## Tabelas principais (conceituais)

| Tabela | Propósito | Notas |
|--------|-----------|--------|
| `users` | Conta, credenciais ou referência a provedor | Não armazenar senha em claro |
| `profiles` | Dados de perfil | FK `user_id` |
| `interactions` | Interações entre usuários | Índices por `from_user_id`, `to_user_id`, `created_at` |
| `ratings` | Avaliações | FKs para usuários; possível FK opcional para `interaction_id` |
| `reputation_snapshots` | Valor atual por usuário (+ contexto) | Desnormalizado para leitura rápida |
| `reputation_history` | Linhas de histórico de score | Volume alto — estratégia de partição/arquivamento em [data-lifecycle.md](data-lifecycle.md) |
| `reports` / `appeals` | Moderação futura | Opcional no schema inicial como stub |

## Separação operacional vs reputação

| Camada de dados | Conteúdo | Fonte da escrita principal |
|-----------------|----------|----------------------------|
| **Operacional** | `users`, `profiles`, `interactions`, `ratings` | `apps/api` (transacional) |
| **Projeção / analytics** | `reputation_snapshots`, `reputation_history` | `worker-python` (assíncrono), possivelmente leituras na API |

## Integridade e consistência

- **Transações:** gravação de `ratings` e eventos de fila na mesma unidade lógica quando possível (padrão outbox mencionado em [database-standards.md](../07-standards/database-standards.md)).  
- **Leitura:** API pode ler `reputation_snapshots`; se desatualizado, exibir conforme política de produto (timestamp `computed_at`).

## Índices (diretrizes)

- FKs e colunas de filtro frequente (`user_id`, `context_key`, `created_at`).  
- Evitar índice redundante; revisar após volume real.

## Mudanças

Qualquer alteração estrutural deve atualizar este documento e a matriz em [traceability-matrix.md](../00-governance/traceability-matrix.md).
