# Capacidades de negócio

## Objetivo

Mapear **o quê** a plataforma **Gwan Social Reputation** faz em termos de capacidades estáveis (menos voláteis que histórias de usuário), servindo de âncora para UCs, dados e componentes técnicos. Alinhado à [definição da aplicação](../01-architecture-vision/application-definition.md).

## Mapa de capacidades

| Capacidade | Descrição | Maturidade MVP |
|------------|-----------|----------------|
| **Gestão de identidade e acesso** | Cadastro, autenticação, sessão/token, papéis (usuário, admin — evolutivo), recuperação de conta (evolutivo) | Essencial |
| **Perfil** | Perfil público/privado, metadados, preferências | Essencial |
| **Interações sociais** | Registro de interações entre usuários conforme regras de produto | Essencial (escopo mínimo definido em UC) |
| **Avaliação entre usuários** | Avaliações contextualizadas com regras de negócio | Essencial |
| **Reputação** | Score inicial, reputação **contextual básica**, histórico auditável; cálculo pesado assíncrono | Essencial |
| **Operações assíncronas** | Filas, retries, base para antifraude/ranking/moderação | Base técnica no MVP |
| **Administração** | Painel web para operações e visão transversal (escopo mínimo no MVP) | Parcial |
| **Notificações** | Avisos a usuários (canais múltiplos) | Evolutivo |
| **Moderação** | Denúncias, filas de revisão, decisões | **Fora do MVP** — preparação conceitual |
| **Apelações** | Fluxo de contestação | **Fora do MVP** |
| **Analytics / processamento** | Métricas internas, jobs analíticos, motores no worker | Mínimo no MVP (logs + jobs de reputação); evolução posterior |

## Capacidades transversais

- **Governança e conformidade arquitetural:** ADRs, checklist, matriz de rastreabilidade.  
- **Observabilidade:** correlação de requisições, erros padronizados.  
- **Segurança:** proteção de dados pessoais, rate limiting básico (Redis).

## Atores (negócio)

| Ator | Relação com as capacidades |
|------|----------------------------|
| Usuário final | Identity, Profile, Interactions, Ratings, Reputation (leitura) |
| Administrador | Administration, Identity (papéis), visão de dados agregados (evolutivo) |
| Moderador / suporte | Moderação e ferramentas operacionais (pós-MVP) |
| Sistema / motores | Operações assíncronas, Analytics/Processing |

## Relação com casos de uso

Cada capacidade essencial deve ter pelo menos um UC em [use-cases.md](../04-application-architecture/use-cases.md).
