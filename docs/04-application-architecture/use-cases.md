# Catálogo de casos de uso

## Objetivo

Listar casos de uso com **ID estável** para rastreabilidade na aplicação **Gwan Social Reputation** (ver [application-definition.md](../01-architecture-vision/application-definition.md)): **toda nova funcionalidade** deve mapear para um UC existente ou novo, atualizando este arquivo e a [traceability-matrix.md](../00-governance/traceability-matrix.md).

## Convenção de IDs

- `UC-<DOMÍNIO>-NN` — ex.: `UC-RAT-01`  
- Estados: **Planejado** | **MVP** | **Em evolução** | **Depreciado**

## Autenticação e identidade

| ID | Nome | Ator | Pré-condições | Pós-condições | Serviços |
|----|------|------|---------------|---------------|----------|
| UC-AUTH-01 | Registrar usuário | Visitante | Email único válido | Conta e perfil mínimo criados | `api-node`, PostgreSQL |
| UC-AUTH-02 | Autenticar (login) | Usuário | Conta ativa | Tokens de sessão emitidos | `api-node`, Redis opcional |

### Protótipo web (sem API)

As rotas `/login` e `/register` em **`apps/web`** persistem sessão e contas de demonstração em **`localStorage`**. Isso **não** satisfaz **UC-AUTH-01** nem **UC-AUTH-02** até existirem persistência em PostgreSQL, política de email único e emissão de tokens na **`api-node`**. Objetivo do protótipo: UX, demos e evolução incremental da interface.

## Perfil

| ID | Nome | Ator | Pré-condições | Pós-condições | Serviços |
|----|------|------|---------------|---------------|----------|
| UC-PROF-01 | Visualizar perfil | Usuário / público | Perfil existe | Dados conforme privacidade | `api-node` |
| UC-PROF-02 | Atualizar próprio perfil | Usuário autenticado | — | Perfil atualizado | `api-node` |

## Interações e avaliações

| ID | Nome | Ator | Pré-condições | Pós-condições | Serviços |
|----|------|------|---------------|---------------|----------|
| UC-INT-01 | Registrar interação | Usuário autenticado | Regras de produto satisfeitas | Interação persistida | `api-node` |
| UC-RAT-01 | Submeter avaliação | Avaliador | elegibilidade (ex.: pós-interação) | Rating persistido; job de recálculo enfileirado | `api-node`, Redis |
| UC-RAT-02 | Listar avaliações recebidas/enviadas | Usuário | — | Lista paginada | `api-node` |

## Reputação

| ID | Nome | Ator | Pré-condições | Pós-condições | Serviços |
|----|------|------|---------------|---------------|----------|
| UC-REP-01 | Processar recálculo de reputação | Sistema | Mensagem válida na fila | Snapshots/histórico atualizados | `worker-python`, PostgreSQL |
| UC-REP-02 | Consultar reputação atual | Usuário / público | Snapshots existentes | Exibição de score + metadados | `api-node` |
| UC-REP-03 | Consultar histórico de score | Usuário autorizado | Histórico existe | Série temporal | `api-node` |

## Operações e extensões

| ID | Nome | Ator | Pré-condições | Pós-condições | Serviços |
|----|------|------|---------------|---------------|----------|
| UC-OPS-01 | Executar job genérico de pós-processamento | Sistema | Fila configurada | Métricas/artefatos internos | `worker-python`, Redis |

## Administração (evolutivo)

| ID | Nome | Ator | Pré-condições | Pós-condições | Serviços |
|----|------|------|---------------|---------------|----------|
| UC-ADM-01 | Acessar funções administrativas mínimas (painel web) | Administrador | Conta com papel admin; autenticação válida | Operações permitidas por política (lista evolutiva) | `api-node`, `web` |

Escopo exato do painel (métricas, usuários, auditoria) evolui por release; manter alinhamento com [business-capabilities.md](../02-business-architecture/business-capabilities.md).

## Moderação (planejado)

| ID | Nome | Ator | Pré-condições | Pós-condições | Serviços |
|----|------|------|---------------|---------------|----------|
| UC-MOD-01 | Registrar denúncia | Usuário | — | Denúncia registrada (futuro) | `api-node`, fila |

---

**Regra de governança:** PRs que adicionem comportamento devem citar UC-ID na descrição.
