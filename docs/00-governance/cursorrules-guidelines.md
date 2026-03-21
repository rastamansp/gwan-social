# Diretrizes e racional do `.cursorrules`

## Objetivo

Explicar **por que** cada grupo de regras existe no arquivo [`.cursorrules`](../../.cursorrules) na raiz do repositório, como isso favorece **reuso**, **consistência entre releases** e **governança arquitetural prática**.

## Mapa: grupo de regras → propósito

| Grupo no `.cursorrules` | Por que foi incluído |
|-------------------------|----------------------|
| **Escopo e baseline** | Evita que implementações ignorem a documentação em `/docs` e decisões já registradas (ADRs). |
| **Monorepo e pacotes** | Fixa `apps/*` e `packages/shared-types` como contratos; reduz drift entre Node, Python consumers, React e RN. |
| **Camadas Clean Architecture** | Garante que domínio permaneça testável e independente de Nest/FastAPI/React; facilita trocar infra sem reescrever regras. |
| **Proibição de regra em controllers/UI** | Controllers e componentes mudam com frequência; regras ali geram bugs e duplicação entre web/mobile. |
| **Use cases / application services** | Um lugar óbvio para orquestração e políticas de aplicação; revisões de código e IA focam nesse ponto. |
| **Integração Node ↔ Python** | Maior risco de inconsistência do sistema; regras forçam contrato + documentação + tipos compartilhados. |
| **Dados e migrations** | Mudanças de esquema sem doc quebram rastreabilidade e releases; alinhamento a `data-*`. |
| **Releases e ADR** | Mantém histórico de “por quê” e liga mudanças a negócio/dados/tech. |
| **Duplicação e coesão** | Evita que a mesma fórmula de reputação apareça em 4 lugares; direciona extração para domínio ou worker. |

## Como as regras ajudam no reuso

- **Domínio puro + portas:** funções e políticas reutilizáveis em vários casos de uso e, no limite, mesma semântica para API e workers (via contratos).  
- **`packages/shared-types`:** evita redefinir DTOs em cada app; reduz divergência TypeScript/JavaScript e serve de referência para payloads JSON no Python (documentados).  
- **Utilitários em `packages/shared-utils`:** apenas funções puras e seguras; evita “copiar e colar” entre frontends.

## Como as regras ajudam na consistência entre releases

- Novas features passam pelos **mesmos pontos de ancoragem**: UC, matriz, checklist.  
- `.cursorrules` **não muda** a cada história; quando muda, é sinal de **evolução de baseline** (documentada).  
- Revisores e IA seguem o mesmo roteiro, reduzindo estilo arquitetural “alternativo” por PR.

## Como as regras apoiam governança arquitetural prática

- Ligam **implementação** a **artefatos** (ADR, use-cases, integration-patterns).  
- Tornam **negável** misturar camadas sem que o revisor note (e a própria IA se auto-corrija).  
- Facilitam auditoria: “onde está a regra X?” → domínio ou caso de uso, nunca espalhada em views.

## Manutenção

Quando a arquitetura mudar (novo canal de integração, novo app):

1. Atualizar `/docs` (definição da aplicação, visão, integração, dados).  
2. Atualizar [`.cursorrules`](../../.cursorrules) de forma mínima e coesa.  
3. Registrar ADR se for decisão relevante.  
4. Sincronizar [cursorrules-standards.md](../07-standards/cursorrules-standards.md).

Se o **escopo de produto** mudar (atores, módulos, MVP), atualizar primeiro [application-definition.md](../01-architecture-vision/application-definition.md) e propagar para capacidades, UCs e matriz.
