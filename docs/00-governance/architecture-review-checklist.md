# Checklist de revisão arquitetural (por release ou PR relevante)

## Objetivo

Checklist **mínimo** para reduzir regressões arquiteturais e manter alinhamento com a baseline em [docs/README.md](../README.md).

## Identificação

- [ ] PR/issue referencia **UC(s)** em [use-cases.md](../04-application-architecture/use-cases.md)  
- [ ] Impacto arquitetural preenchido (modelo em [release-governance-model.md](release-governance-model.md))  
- [ ] ADR criado/atualizado se aplicável ([adr-template.md](adr-template.md))

## Negócio e produto

- [ ] Escopo e atores coerentes com [application-definition.md](../01-architecture-vision/application-definition.md)  
- [ ] Comportamento alinhado a capacidades em [business-capabilities.md](../02-business-architecture/business-capabilities.md)  
- [ ] Processo de alto nível coerente com [business-process-overview.md](../02-business-architecture/business-process-overview.md)

## Aplicação

- [ ] **Sem** regra de negócio em controllers apenas; orquestração em **casos de uso**  
- [ ] Novas integrações documentadas em [integration-patterns.md](../04-application-architecture/integration-patterns.md)  
- [ ] Componentes de app (`web`, `mobile`) não duplicam cálculo de reputação

## Dados

- [ ] Alterações de modelo refletidas em [domain-model.md](../03-data-architecture/domain-model.md) e/ou [data-entities.md](../03-data-architecture/data-entities.md)  
- [ ] Ciclo de vida/retenção considerado em [data-lifecycle.md](../03-data-architecture/data-lifecycle.md) se novos dados pessoais ou históricos

## Tecnologia

- [ ] Stack conforme [technology-stack.md](../05-technology-architecture/technology-stack.md) ou ADR justificando desvio  
- [ ] Variáveis/ambientes alinhados a [environment-strategy.md](../05-technology-architecture/environment-strategy.md) (sem segredos no repositório)

## Integração Node ↔ Python

- [ ] Contratos de fila/DTO revisados; alterações em `packages/shared-types` quando aplicável  
- [ ] Idempotência/versionamento de payload considerados ([integration-patterns.md](../04-application-architecture/integration-patterns.md))

## Segurança e privacidade

- [ ] Autenticação/autorização coerentes com [api-standards.md](../07-standards/api-standards.md)  
- [ ] Dados sensíveis não expostos em logs nem em respostas desnecessárias

## Observabilidade (mínimo recomendado)

- [ ] Erros da API com formato padronizado  
- [ ] Correlação `request_id` / `trace_id` quando alterar fluxo transacional (documentar em PR)

## Pós-merge

- [ ] [traceability-matrix.md](traceability-matrix.md) atualizado se mudou rastreabilidade  
- [ ] Nota de release com referência a UC/ADR
