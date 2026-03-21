# Estratégia de devlog técnico (LinkedIn)

## Objetivo

Usar a documentação de **Gwan Social Reputation** como **matéria-prima** para posts técnicos profissionais, sem expor dados sensíveis ou segredos.

## Fontes seguras de conteúdo

| Fonte | Tipo de post |
|-------|----------------|
| ADRs em `docs/adr/` | Decisão X vs Y, trade-offs reais |
| Release notes internas | O que mudou na API, no worker, no modelo |
| [mvp-roadmap.md](../06-delivery/mvp-roadmap.md) | Marcos M1–M5 e lições aprendidas |
| [integration-patterns.md](../04-application-architecture/integration-patterns.md) | Como Node e Python colaboram sem acoplamento |
| [architecture-review-checklist.md](../00-governance/architecture-review-checklist.md) | Cultura de qualidade e governança leve |

## O que não publicar

- Credenciais, URLs internas, dados de usuários, stack traces de produção.  
- Detalhes que facilitem ataque (versões exatas desatualizadas em produção, configuração de firewall).

## Formato sugerido

1. **Contexto** — problema de arquitetura ou produto (1–2 frases).  
2. **Decisão** — o que foi escolhido (sem jargão excessivo).  
3. **Trade-off** — o que se ganhou e perdeu.  
4. **Próximo passo** — evolução ou métrica de sucesso.

## Cadência

- Opcional: após cada **marco** (M2, M4, MVP) ou ADR de impacto alto.  
- Evitar spam: priorizar **uma ideia forte** por post.

## Tom

Profissional, direto, focado em **execução** e aprendizado — alinhado à baseline em [docs/README.md](../README.md).
