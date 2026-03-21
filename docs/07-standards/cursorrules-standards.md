# Política de manutenção do `.cursorrules`

## Objetivo

Garantir que o arquivo [`.cursorrules`](../../.cursorrules) permaneça **alinhado** à baseline em `/docs` e seja atualizado de forma **controlada** quando a arquitetura evoluir.

## Quando atualizar o `.cursorrules`

- Novo app no monorepo (`apps/*`) ou novo pacote (`packages/*`).  
- Mudança nos limites de camadas (ex.: introdução de BFF).  
- Novo padrão de integração obrigatório (ex.: gRPC entre Node e Python).  
- Política explícita de testes ou segurança alterada por ADR.

## Quem atualiza

- Autor da mudança arquitetural no mesmo PR que altera `/docs` relevantes.  
- Revisor valida coerência com [cursorrules-guidelines.md](../00-governance/cursorrules-guidelines.md).

## O que não fazer

- Inflar o `.cursorrules` com tutoriais genéricos.  
- Duplicar documentação inteira — preferir **referência** a `docs/...`.  
- Contradizer ADRs aceitos; se mudar decisão, novo ADR primeiro.

## Sincronização

Após editar `.cursorrules`, verificar:

1. [architecture-principles.md](../00-governance/architecture-principles.md)  
2. [integration-patterns.md](../04-application-architecture/integration-patterns.md)  
3. [folder-structure.md](folder-structure.md)

## Versão

Registrar mudanças significativas no PR; opcionalmente incrementar nota de rodapé no próprio `.cursorrules` (data + breve lista). Baseline documental de referência: **v2.1** ([docs/README.md](../README.md)).
