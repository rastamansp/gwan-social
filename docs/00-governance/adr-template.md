# Template de ADR

Copie para `docs/adr/NNNN-titulo-curto.md`.

```markdown
# ADR NNNN — Título curto

## Status

Proposto | Aceito | Substituído por ADR-XXXX | Depreciado

## Data

AAAA-MM-DD

## Contexto

Qual problema ou força motivadora? Qual o cenário técnico/negócio?

## Decisão

O que foi decidido, em linguagem direta.

## Alternativas consideradas

1. **Alternativa A** — prós / contras  
2. **Alternativa B** — prós / contras  

## Consequências

- Positivas:  
- Negativas / dívidas:  
- Impacto em dados, integração, deploy:

## Referências

- UC: UC-XXX  
- Docs: links para use-cases, integration-patterns, data-entities  
- PRs: (preencher após implementação)
```

## Convenção de arquivos

- Pasta: [docs/adr/](../adr/)  
- Nome: `NNNN-kebab-case-title.md` (ex.: `0001-redis-bullmq-for-async-jobs.md`)  
- Numeração sequencial.

## Relação com o código

ADRs **não** substituem código nem testes; documentam **por que** uma decisão foi tomada para auditoria e onboarding.
