# Estratégia de ambientes

## Objetivo

Definir **dev**, **staging** e **produção** em termos de configuração, segredos e paridade, sem valores sensíveis neste repositório.

## Ambientes

| Ambiente | Propósito | Dados |
|----------|-----------|--------|
| **local** | Desenvolvimento com Docker Compose | Dados fictícios apenas; nunca PII real |
| **staging** | Validação pré-produção | Anonimizado ou cópia controlada |
| **production** | Usuários reais | Políticas de backup e acesso restritas |

## Variáveis (categorias)

- **Database:** `DATABASE_URL`  
- **Redis:** `REDIS_URL`  
- **JWT:** `JWT_SECRET`, tempos de expiração  
- **API:** `API_PUBLIC_URL`  
- **Worker:** filas, concorrência, timeouts  
- **Web (build-time Vite):** `VITE_API_URL`, `VITE_APP_NAME`, `VITE_APP_VERSION` — injetadas no bundle em `docker build` (ver [docker/Dockerfile](../../docker/Dockerfile)).  
- **Web (Traefik / Compose produção):** `GWAN_SOCIAL_HOST` — domínio na regra `Host(\`…\`)` (ver [.env.example](../../.env.example) na raiz).

Nomes exatos adicionais podem ser listados em `.env.example` à medida que a API e o worker existirem (sem segredos no Git).

## Política de `.env`

- **Não commitar** `.env` com segredos.  
- **Não sobrescrever** `.env` local de outro desenvolvedor sem acordo.  
- Rotação de segredos em produção conforme processo de ops.

## Paridade

- Mesmas **versões major** de PostgreSQL/Redis entre staging e produção quando possível.  
- Migrations testadas em staging antes de produção.

## CI/CD (futuro)

- Pipeline que executa **npm** install/build (workspaces), lint (quando existir), migrations em ambiente dedicado — documentar em ADR ao introduzir.
