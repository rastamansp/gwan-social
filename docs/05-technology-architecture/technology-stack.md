# Stack tecnológica

## Objetivo

Registrar a **stack fixa** acordada para o monorepo **gwan-social** e premissas (sem fixar provedor cloud na baseline).

## Tabela de stack

| Camada | Tecnologia | Versão | Notas |
|--------|------------|--------|--------|
| Monorepo | **npm** workspaces | npm 10+ (com Node 20+) | Raiz `gwan-social`; **pnpm** opcional (não versionado no repo) |
| Backend API | **Node.js** + **NestJS** | LTS + major estável | Clean Architecture por módulos — **planeado** |
| Worker | **Python** + **FastAPI** | 3.11+ sugerido | Workers para fila; HTTP opcional para health — **planeado** |
| Web | **React** + **Vite** + **Tailwind CSS** | React 19, Vite 6, RR 7, Tailwind 4 | SPA em `apps/web` — **implementado** (mock) |
| Mobile | **React Native** | (definir) | Mesma API `/v1` — **planeado** |
| Banco | **PostgreSQL** | 15+ sugerido | SoR transacional |
| Cache / fila | **Redis** | 7+ sugerido | Cache + BullMQ/estrutura de fila |
| Containerização | **Docker** | — | Imagens por app |
| Orquestração local | **Docker Compose** | — | Ver [deployment-view.md](deployment-view.md) |

## Premissas

- **Sem** vendor cloud obrigatório no MVP; deploy em VMs/Kubernetes pode vir depois com ADR.  
- **Sem** testes unitários obrigatórios até decisão explícita (ver [architecture-principles.md](../00-governance/architecture-principles.md)).

## Adição de tecnologia

Nova dependência significativa → **ADR** + atualização deste arquivo.
