# Riscos, premissas e restrições

## Objetivo

Registrar fatores que **condicionam** decisões arquiteturais e de entrega, para revisão periódica (releases, retrospectivas).

## Premissas

| ID | Premissa | Implicação se falhar |
|----|-----------|----------------------|
| P1 | Equipe aplica checklist e ADRs com disciplina | Débito arquitetural e inconsistência entre serviços |
| P2 | PostgreSQL é a fonte da verdade transacional | Perda de consistência se caches forem tratados como fonte |
| P3 | Redis disponível para cache e fila em dev/prod | Plano B: fila embutida só para dev (exige ADR) |
| P4 | Processamento pesado permanece no `worker-python` | Sobrecarga no `api-node` se alguém mover lógica para lá |
| P5 | Monorepo **npm workspaces** na raiz (`pnpm` opcional) | Scripts e CI devem usar **npm** por omissão; adoção de pnpm exige alinhamento explícito |

## Restrições

| ID | Restrição | Origem |
|----|-----------|--------|
| C1 | Sem testes unitários obrigatórios na fase inicial | Decisão de projeto (revisável) |
| C2 | Regras de negócio fora de controllers/UI | Arquitetura Clean + `.cursorrules` |
| C3 | Integração Node ↔ Python via contratos documentados (fila/API), não lógica duplicada opaca | Baseline |
| C4 | Não commitar segredos; `.env` não versionado | Segurança |

## Riscos

| ID | Risco | Prob. | Impacto | Mitigação |
|----|-------|-------|---------|-----------|
| R1 | Inconsistência eventual de reputação visível ao usuário | Média | Médio | Estados de leitura claros; versionamento de snapshot; retries idempotentes |
| R2 | Complexidade de fila (perda de mensagem, duplicata) | Média | Alto | Idempotência, `schema_version`, monitoração básica; ADR para biblioteca de fila |
| R3 | Escopo de moderação/apelações antecipado demais | Média | Alto | Manter fora do MVP; apenas extensões no modelo se necessário |
| R4 | Divergência de tipos entre TS e Python | Média | Médio | `shared-types` + documentação de payload em [integration-patterns.md](../04-application-architecture/integration-patterns.md) |
| R5 | Responsabilidade legal/regulatória de reputação social | Baixa a média | Alto | Revisão de produto/compliance antes de features sensíveis; retenção em [data-lifecycle.md](../03-data-architecture/data-lifecycle.md) |

## Revisão

- Reavaliar **a cada release major** ou trimestralmente o que ocorrer primeiro.  
- Riscos materializados: registrar em ADR ou post-mortem leve no PR/release notes.
