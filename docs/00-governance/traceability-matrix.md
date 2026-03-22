# Matriz de rastreabilidade

## Objetivo

Ligar **objetivo de negócio** → **módulo / caso de uso** → **dados principais** → **tecnologia**, permitindo evolução por release sem perder o fio condutor.

## Legenda

- **Objetivo:** resultado de negócio desejado.  
- **UC:** identificador em [use-cases.md](../04-application-architecture/use-cases.md).  
- **Dados:** entidades/agregados em [data-entities.md](../03-data-architecture/data-entities.md).  
- **Tech:** componentes em [application-components.md](../04-application-architecture/application-components.md).

## Matriz (baseline v2.2)

| Objetivo de negócio | UC(s) | Dados | Tecnologia |
|---------------------|-------|-------|------------|
| Usuário autenticado de forma segura | UC-AUTH-01, UC-AUTH-02 | `users`, `sessions` / credenciais | `apps/api`, PostgreSQL, Redis (sessão/rate) |
| Perfil visível e editável | UC-PROF-01, UC-PROF-02 | `profiles` | `apps/api`, PostgreSQL; `web`, `mobile` |
| Interações entre usuários registradas | UC-INT-01 | `interactions` | `apps/api`, PostgreSQL |
| Avaliações entre usuários com regras explícitas | UC-RAT-01, UC-RAT-02 | `ratings` | `apps/api`, PostgreSQL |
| Reputação global e contextual calculada | UC-REP-01, UC-REP-02 | `reputation_snapshots`, `reputation_history` | `worker-python`, PostgreSQL, Redis fila |
| Histórico de score auditável | UC-REP-03 | `reputation_history` | `apps/api` leitura; `worker-python` escrita assíncrona |
| Operações administrativas mínimas (painel) | UC-ADM-01 (evolutivo) | agregados existentes + auditoria futura | `web`, `apps/api` (papel admin) |
| Processamento assíncrono antifraude/ranking (evolutivo) | UC-OPS-01 | filas + tabelas de resultado | `worker-python`, Redis |
| Denúncias e apelações (futuro) | UC-MOD-01 (planejado) | `reports`, `appeals` | `apps/api` + `worker-python` (futuro) |

## Nota sobre implementação atual

**Autenticação** e **perfil** têm cobertura em **`apps/api` + PostgreSQL** (registo, login, refresh, `GET/PATCH /me`, avatar) e a **web** consome essas rotas com **`VITE_API_URL`**. Objetivos que exigem **interações obrigatórias antes de avaliar**, **pipeline de reputação assíncrona** e **Redis** continuam **em aberto** na matriz. Ver [use-cases.md](../04-application-architecture/use-cases.md).

## Manutenção

- A cada release que altere escopo: atualizar linhas afetadas e revisar [docs/README.md](../README.md) versão se necessário.  
- Novos objetivos exigem nova linha ou revisão de UC existente.
