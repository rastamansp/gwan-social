# Backlog inicial (MVP)

## Objetivo

Lista **priorizada** de épicos e histórias para **Gwan Social Reputation**, com vínculo aos UCs ([application-definition.md](../01-architecture-vision/application-definition.md)).

## Épicos

| ID | Épico | Prioridade | UCs |
|----|-------|------------|-----|
| E1 | Fundações monorepo e infra local | P0 | — |
| E2 | Autenticação e perfil | P0 | UC-AUTH-*, UC-PROF-* |
| E3 | Interações e avaliações | P0 | UC-INT-01, UC-RAT-* |
| E4 | Pipeline de reputação assíncrona | P0 | UC-REP-01 |
| E5 | Leitura de reputação e histórico | P0 | UC-REP-02, UC-REP-03 |
| E6 | Clientes web e mobile | P1 | — |
| E8 | Administração (painel mínimo) | P1 | UC-ADM-01 |
| E7 | Moderação | P2 (pós-MVP) | UC-MOD-01 |

**Estado atual:** o **E6 (web)** consome **`/api/v1`** com **`VITE_API_URL`** (feed, perfil, post, próximo, ranking/pessoas a partir do feed). **`apps/api`** persiste em **PostgreSQL** (Prisma). O **mobile** ainda não existe no repositório.

## Histórias (amostra — detalhar na ferramenta de gestão)

| ID | História | Épico | UC |
|----|----------|-------|-----|
| H1 | Como dev, quero `docker compose up` subindo API, worker, Postgres e Redis | E1 | — |
| H2 | Como usuário, quero criar conta e fazer login | E2 | UC-AUTH-01, UC-AUTH-02 |
| H3 | Como usuário, quero editar meu perfil | E2 | UC-PROF-02 |
| H4 | Como usuário, quero registrar interação com outro usuário | E3 | UC-INT-01 |
| H5 | Como usuário, quero avaliar outro após interação válida | E3 | UC-RAT-01 |
| H6 | Como sistema, quero recalcular reputação ao receber avaliação | E4 | UC-REP-01 |
| H7 | Como usuário, quero ver minha reputação e histórico | E5 | UC-REP-02, UC-REP-03 |
| H8 | Como usuário, quero usar o app web para fluxo principal | E6 | — |
| H9 | Como usuário, quero usar o app mobile para fluxo principal | E6 | — |
| H10 | Como administrador, quero acessar funções mínimas do painel web | E8 | UC-ADM-01 |

## Dependências entre times/serviços

- **E4** depende de **E3** (evento de rating).  
- **E5** depende de **E4** (dados derivados).  
- **E6** e **E8** dependem de **E2–E5** (API estável; **E8** exige modelo de papéis/admin na API).

## Roadmap evolutivo (resumo)

Ver [mvp-roadmap.md](mvp-roadmap.md) — após MVP: moderação, antifraude, OIDC, observabilidade avançada, testes automatizados (ADR).
