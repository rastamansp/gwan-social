# Roadmap do MVP

## Objetivo

Definir **fases do MVP** e critérios de pronto para a primeira entrega utilizável de **Gwan Social Reputation** (definição em [application-definition.md](../01-architecture-vision/application-definition.md)).

## Fases

| Fase | Entregas | Critério de pronto |
|------|----------|--------------------|
| **M1 — Fundações** | Monorepo **npm**, Docker Compose (**Postgres + Redis** + serviços app), esqueleto Nest com camadas; esqueleto worker Python; `shared-types` mínimo | API sobe healthcheck; worker conecta Redis/DB; sem regra de negócio em controller |
| **M2 — Identidade e perfil** | UC-AUTH-01/02, UC-PROF-01/02, migrations iniciais | Fluxo cadastro/login; edição de perfil; erros padronizados |
| **M3 — Social + avaliações** | UC-INT-01, UC-RAT-01/02 | Interações e ratings persistidos; job enfileirado ao avaliar |
| **M4 — Reputação assíncrona** | UC-REP-01/02/03 | Worker atualiza snapshots/histórico; leitura via API com `computed_at` |
| **M5 — Clientes** | `web` e `mobile` consumindo `/v1` | Telas principais alinhadas aos UC; sem lógica de score no cliente |

**Notas:**

- **M1:** em paralelo já existe na raiz um Compose que faz apenas **build estático da web + Nginx** (e variante Traefik em produção). Isso **não** cumpre o critério de pronto da M1 (API, worker, Postgres, Redis).
- **M5:** entrega **incremental** permitida — a primeira onda pode ser **protótipo web com mocks** (ver [project-tasks.md](project-tasks.md)); a linha da tabela permanece válida até `web` e `mobile` consumirem `/v1`.

## Fora do escopo do MVP

- Moderação completa (UC-MOD-01)  
- Antifraude avançado e ranking global complexo (base em UC-OPS-01 evolutivo)  
- Testes unitários automatizados (revisável por ADR)

## Dependências críticas

- Contrato de fila estável entre Node e Python ([integration-patterns.md](../04-application-architecture/integration-patterns.md))  
- Modelo de dados para snapshots/histórico ([data-entities.md](../03-data-architecture/data-entities.md))

## Roadmap evolutivo (pós-MVP)

| Onda | Foco | Exemplos |
|------|------|----------|
| **v2** | Experiência e escala | UI completa web+mobile, índices e otimização de leitura |
| **v3** | Confiança e segurança | Moderação UC-MOD-01, apelações, auditoria expandida |
| **v4** | Inteligência operacional | Antifraude/ranking avançado, observabilidade, filas externas se necessário |
| **Contínua** | Plataforma | OIDC/SSO (ADR), testes automatizados (ADR), multi-região |

Cada onda deve passar pelo [release-governance-model.md](../00-governance/release-governance-model.md).

## Marcos para comunicação (LinkedIn)

Ver [devlog-strategy.md](../08-linkedin/devlog-strategy.md) — sugerido: post ao fechar M2, M4 e no release MVP.
