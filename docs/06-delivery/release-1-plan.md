# Plano da Release 1 (R1)

## Objetivo

Consolidar o **primeiro incremento entregável** de **Gwan Social Reputation** após as fundações, alinhado ao [backlog.md](backlog.md), ao [mvp-roadmap.md](mvp-roadmap.md) e à [definição da aplicação](../01-architecture-vision/application-definition.md).

## Escopo R1 (proposta)

**Meta:** completar **M1 a M4** (backend + worker + contratos), com **M5** parcialmente iniciado (um cliente mínimo).

| Incluído | Exclusões explícitas |
|----------|----------------------|
| API Nest com módulos por capacidade; JWT MVP | OIDC externo |
| Worker Python processando fila de reputação | Antifraude ML |
| PostgreSQL + migrations acordadas | Particionamento avançado de histórico |
| Redis fila + cache básico | Broker externo |
| Documentação de payload `schema_version` | Geração automática de schema |

## Entradas de governança

- ADR para escolha final BullMQ ↔ bridge Python (se ainda aberta na implementação)  
- Checklist em [architecture-review-checklist.md](../00-governance/architecture-review-checklist.md)  
- Matriz atualizada em [traceability-matrix.md](../00-governance/traceability-matrix.md)

## Critérios de aceite (R1)

1. Fluxo completo: **rating → fila → worker → snapshot legível na API**.  
2. Nenhuma regra de negócio de reputação em controllers ou componentes UI (quando UI existir).  
3. Documentação em `/docs` reflete o comportamento entregue (ajustes finos permitidos no PR).

## Timeline

A definir pela equipe; esta baseline não fixa datas.

## Pós-R1

- Planejar **R2**: experiência completa web+mobile, observabilidade, hardening de segurança.
