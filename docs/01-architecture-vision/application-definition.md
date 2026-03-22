# Definição da aplicação — Gwan Social Reputation

## Objetivo

Registrar a **definição funcional** do produto (nome provisório, visão, problema, escopo, atores, módulos e capacidades) como referência única para negócio, arquitetura e releases. Complementa a visão técnica em [vision.md](vision.md).

## Identidade

| Campo | Valor |
|-------|--------|
| **Nome provisório** | **Gwan Social Reputation** |
| **Repositório / código** | monorepo **gwan-social** (documentado em [folder-structure.md](../07-standards/folder-structure.md)) |

## Visão do produto

Plataforma digital de **reputação social** inspirada na ideia de avaliação contextual entre pessoas (referência cultural: universo de “Nosedive”), com abordagem **prática**, **modular** e **tecnicamente governada** — evitando reduzir pessoas a uma única “nota de valor humano global”.

## Objetivo da aplicação

Permitir que usuários realizem **interações** e **avaliações contextuais** entre si, gerando um sistema de reputação que possa ser **consultado**, **recalculado**, **auditado** e **evoluído** com segurança.

## Problema que a aplicação resolve

Estruturar um modelo de reputação digital baseado em:

- interações registradas;
- avaliações contextualizadas;
- processamento inteligente (assíncrono);

permitindo ao sistema:

- registrar interações entre usuários;
- receber avaliações de forma controlada;
- calcular reputações **por contexto** (não apenas uma métrica opaca global);
- reduzir abusos com **antifraude** e **moderação** (evolutivo);
- manter **rastreabilidade** de mudanças e de score;
- servir **usuários finais** e **equipes operacionais** (admin/moderador/suporte).

## Princípios de produto (reputação)

A reputação **não** deve ser tratada como uma nota única de “valor humano” global. Priorizar:

- confiança em interações;
- qualidade de experiência entre usuários;
- consistência histórica de avaliações;
- reputação por **domínio ou contexto**;
- sinais de abuso, fraude ou manipulação (tratamento progressivo no **worker Python**).

## Tipos de usuários e atores

| Ator | Papel | MVP |
|------|--------|-----|
| **Usuário final** | Cadastro, perfil, interações, avaliações, consulta de reputação | Sim |
| **Administrador** | Configuração, visão transversal, operações de plataforma | Parcial (base para painel web) |
| **Moderador** | Filas de revisão, decisões sobre conteúdo/reputação | Futuro (ganchos) |
| **Operador de suporte** | Investigação assistida, ferramentas operacionais | Futuro |
| **Serviços automatizados / motores analíticos** | Jobs, pipelines internos | Sim (worker + filas) |

## Módulos principais (mapa lógico)

Mapeamento conceitual — implementação em bounded contexts e apps conforme [application-components.md](../04-application-architecture/application-components.md).

| Módulo | Descrição resumida | MVP |
|--------|-------------------|-----|
| **Identity & Access** | Autenticação, autorização, sessões | Sim |
| **User Profile** | Perfil público/privado, preferências | Sim |
| **Interactions** | Registro de interações entre usuários | Sim |
| **Ratings** | Avaliações com regras e contexto | Sim |
| **Reputation** | Score, contextos, snapshots, histórico, recálculo | Sim (contextual **básico** no MVP) |
| **Moderation** | Denúncias, filas, decisões | Futuro |
| **Appeals** | Apelações | Futuro |
| **Administration** | Painel web, configurações operacionais | Inicial (escopo mínimo) |
| **Notifications** | Avisos a usuários (in-app/email/push) | Evolutivo |
| **Analytics / Processing** | Antifraude, ranking contextual, métricas | Base assíncrona no MVP; regras avançadas depois |

## Capacidades esperadas (resumo)

- Cadastro e autenticação; perfil; interações; avaliações usuário→usuário.
- Cálculo e exibição de reputação; **reputação por contexto**; histórico de score.
- Processamento assíncrono pesado (**Python**): reputação, base para antifraude/ranking/moderação.
- **Web:** painel administrativo/social inicial.
- **Mobile:** experiência social/operacional inicial.
- **Governança:** documentação baseline, ADRs, matriz, releases (já estabelecida em `/docs`).

## Escopo inicial do MVP (priorização)

Conforme [mvp-roadmap.md](../06-delivery/mvp-roadmap.md) e [backlog.md](../06-delivery/backlog.md):

- Autenticação; perfis; interações; avaliações; score inicial; reputação contextual **básica**.
- Backend transacional **Node.js (NestJS)**; processamento assíncrono **Python**; **PostgreSQL**; **Redis** (fila/cache).
- Frontend web e app mobile **iniciais**; base documental de arquitetura e governança.

**Explícito fora ou adiado no MVP:** moderação completa, apelações, ranking contextual avançado, antifraude ML — preparação conceitual e extensibilidade via worker e dados.

**Estado técnico atual do repositório:** **front-end web** com sessão JWT e dados via **`VITE_API_URL`**; **`apps/api`** (NestJS) com **PostgreSQL (Prisma)** para feed, perfis, auth e posts. **Worker Python, Redis em produção e mobile** ainda não implementados — alinhado ao snapshot em [docs/README.md](../README.md). O ficheiro **`gwan-social.fixtures.json`** permanece como **fonte opcional do `prisma seed`**, não como read model em runtime.

## Comportamento esperado da solução (resumo)

- API **rápida** para operações transacionais; trabalho pesado **desacoplado** e assíncrono.
- Regras de negócio **isoladas** de frameworks (Clean Architecture).
- Reputação **recalculável** e **rastreável** (histórico, timestamps, ADRs para mudanças relevantes).
- Evolução por **releases** com impacto arquitetural identificável ([release-governance-model.md](../00-governance/release-governance-model.md)).

## Relação com outros documentos

- Visão técnica e trade-offs: [vision.md](vision.md)  
- Capacidades de negócio: [business-capabilities.md](../02-business-architecture/business-capabilities.md)  
- Casos de uso: [use-cases.md](../04-application-architecture/use-cases.md)  
- Matriz objetivo → UC → dados → tech: [traceability-matrix.md](../00-governance/traceability-matrix.md)
