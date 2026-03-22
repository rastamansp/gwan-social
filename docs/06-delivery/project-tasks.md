# Tarefas e progresso do projeto (Gwan Social Reputation)

## Objetivo

Arquivo **versionado no Git** para acompanhar etapas macro, fases do MVP e itens pendentes, sem depender de ferramenta externa. Atualize os checkboxes ao concluir trabalho ou ao desdobrar novas subtarefas.

**Como usar**

1. Marque `[x]` quando o item estiver **concluído e revisado**.  
2. Use a coluna **Notas / PR** para referência (opcional).  
3. Ao mudar escopo relevante, alinhar [application-definition.md](../01-architecture-vision/application-definition.md), UCs e matriz (governança em [release-governance-model.md](../00-governance/release-governance-model.md)).

**Atalho na raiz do repositório:** [PROJECT_TASKS.md](../../PROJECT_TASKS.md)

---

## Etapas macro (governança e entrega)

| Etapa | Descrição | Status |
|-------|-----------|--------|
| **ETAPA 1** | Baseline documental, governança TOGAF-pragmática, `.cursorrules` | Concluída |
| **ETAPA 2** | Definição funcional do produto (`application-definition.md`), baseline documental (v2.0 → **v2.2** snapshot as-is; `apps/api` + matriz v2.2) | Concluída |
| **ETAPA 3** | Implementação do monorepo e MVP (código + infra local) | Em aberto |

---

## ETAPA 3 — Implementação (checklist por fase MVP)

Referência: [mvp-roadmap.md](mvp-roadmap.md), [backlog.md](backlog.md).

### M1 — Fundações

- [x] `package.json` raiz com **npm workspaces** (`apps/*`, `packages/*`) — ver [README.md](../../README.md) (`pnpm-workspace.yaml` opcional quando adotar pnpm)
- [x] Compose na raiz + [docker/Dockerfile](../../docker/Dockerfile): **apenas** build da web e Nginx (`docker-compose.yml`, `docker-compose-production.yml` com Traefik) — **não** substitui o Compose M1 com Postgres, Redis, API e worker
- [x] `apps/api`: NestJS — `presentation/http/v1`, `application` (use cases), `infrastructure/prisma`, prefixo **`/api/v1`**, OpenAPI/Swagger — ver [README.md](../../README.md)
- [x] `apps/api`: persistência **PostgreSQL** (Prisma) e **auth JWT** (`/auth/*`, `/me`, posts do utilizador) — ver [api-standards.md](../07-standards/api-standards.md)
- [ ] `apps/api`: publicação em fila e envelope normativo `{ data, meta }` (alinhamento futuro a [api-standards.md](../07-standards/api-standards.md))
- [ ] `apps/worker-python`: esqueleto FastAPI + worker + consumo Redis (conforme ADR futuro)
- [ ] `packages/shared-types` mínimo (contratos base)
- [ ] `packages/shared-utils` mínimo (se necessário na M1)
- [ ] `infra/docker`: Docker Compose (PostgreSQL + Redis + serviços app)
- [ ] Healthcheck API; worker conecta Redis/DB
- [ ] Documentar comando de subida local da **stack M1** no README ou em `infra/docker` (documentação Docker da **web** já na raiz [README.md](../../README.md))

**Critério de pronto M1:** API com health; worker sobe; Compose funcional; sem regra de negócio em controller.

### M2 — Identidade e perfil

- [ ] UC-AUTH-01 — Registrar usuário
- [ ] UC-AUTH-02 — Login / tokens
- [ ] UC-PROF-01 — Visualizar perfil
- [ ] UC-PROF-02 — Atualizar perfil
- [ ] Migrations iniciais (`users`, `profiles` ou equivalente)
- [ ] Erros HTTP alinhados a [api-standards.md](../07-standards/api-standards.md)

### M3 — Social + avaliações

- [ ] UC-INT-01 — Registrar interação
- [ ] UC-RAT-01 — Submeter avaliação (+ enfileirar recálculo)
- [ ] UC-RAT-02 — Listar avaliações
- [ ] Persistência conforme [data-entities.md](../03-data-architecture/data-entities.md)

### M4 — Reputação assíncrona

- [ ] UC-REP-01 — Worker processa recálculo
- [ ] UC-REP-02 — Consultar reputação atual (`computed_at` ou equivalente)
- [ ] UC-REP-03 — Histórico de score
- [ ] Contrato de fila + `schema_version` ([integration-patterns.md](../04-application-architecture/integration-patterns.md))

### M5 — Clientes

**Protótipo web (mock, sem consumo HTTP de `/api/v1`) — concluído para demonstração:**

- [x] React + TypeScript + Tailwind v4; **feed** (`/`) com abas `?tab=` **feed**, **perfil**, **pessoas**, **ranking**
- [x] **Detalhe de post** (`/post/:id`) layout editorial Nosedive + **votação 1–5 estrelas** mock (sem API)
- [x] `/nearby`, `/presentation`, wizard `/user/:id/create-post` (passos content / media / review)
- [x] `/login`, `/register`, `/user/:id/edit` — sessão e contas demo em **`localStorage`** (não cumpre UC-AUTH/UC-PROF até `apps/api` + DB)
- [x] Docker: `docker-compose.yml` (Nginx local, `WEB_PORT`), `docker-compose-production.yml` (Traefik, `GWAN_SOCIAL_HOST`), endpoint **`/health`**, `.env.example` e args de build **`VITE_*`**

- [ ] `apps/web` — fluxos principais contra **`/api/v1`**
- [ ] `apps/mobile` — fluxos principais contra **`/api/v1`**
- [ ] Sem cálculo de reputação duplicado no cliente (apenas UI/API)

### Pós-MVP / evolutivo (não bloqueia MVP)

- [ ] UC-ADM-01 — Painel admin mínimo (épico E8 / [backlog.md](backlog.md))
- [ ] UC-MOD-01 — Moderação
- [ ] Testes automatizados (requer ADR / mudança de política)
- [ ] CI/CD (pipeline)

---

## Backlog rápido (épicos)

Espelho de [backlog.md](backlog.md) — marque quando o épico estiver entregue no ambiente alvo.

- [ ] E1 — Fundações monorepo e infra local
- [ ] E2 — Autenticação e perfil
- [ ] E3 — Interações e avaliações
- [ ] E4 — Pipeline de reputação assíncrona
- [ ] E5 — Leitura de reputação e histórico
- [ ] E6 — Clientes web e mobile
- [ ] E8 — Administração (painel mínimo)
- [ ] E7 — Moderação (pós-MVP)

---

## Histórico de atualizações (opcional)

| Data | Autor | Notas |
|------|-------|--------|
| 2026-03-20 | — | Criação do rastreador; ETAPAs 1–2 documentais marcadas como concluídas |
| 2026-03-20 | — | `apps/web`: Vite + React + TS + Tailwind; workspaces na raiz |
| 2026-03-20 | — | `apps/web`: react-router, UI your-social-score + componentes Nosedive editorial (`SocialPostCard`, etc.) |
| 2026-03-21 | — | Sincronização documentação TOGAF (baseline 2.1): snapshot as-is vs alvo; npm; Docker raiz; protótipo auth/UI; matriz v2.1 |
| 2026-03-21 | — | Baseline 2.2: `apps/api` no snapshot; matriz v2.2; prefixo `/api/v1`; project-tasks M1 parcial |
