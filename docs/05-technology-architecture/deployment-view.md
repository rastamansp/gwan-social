# Visão de deployment

## Objetivo

Descrever a **visão lógica** de deployment (containers, redes, dados) para **desenvolvimento local**, **produção da web** já suportada no repo e **evolução futura** da stack completa, sem amarrar a um provedor cloud específico.

## Web estática — implementado (as-is)

Build multi-stage ([docker/Dockerfile](../../docker/Dockerfile)): dependências npm → `npm run build` em `apps/web` → imagem **Nginx** com `dist/` e SPA fallback.

| Cenário | Ficheiro | Rede / porta |
|---------|----------|----------------|
| **Local** | [docker-compose.yml](../../docker-compose.yml) | Porta host `${WEB_PORT:-8080}` → 80 no container |
| **Produção (Traefik)** | [docker-compose-production.yml](../../docker-compose-production.yml) | Rede Docker externa `gwan`; host público via `GWAN_SOCIAL_HOST` (`.env`); TLS e entrypoint conforme Traefik do ambiente |

Healthcheck HTTP: `GET /health` (Nginx). Variáveis de build: `VITE_*` no `docker build` — ver [environment-strategy.md](environment-strategy.md).

```mermaid
flowchart LR
  subgraph webonly [Web_container]
    NG[nginx_alpine]
    ST[static_dist]
    NG --> ST
  end
  DEV[Desenvolvedor_ou_Traefik] -->|HTTP| NG
```

## Stack completa — alvo ETAPA 2/3 (M1)

| Serviço | Container / processo | Porta (exemplo) |
|---------|----------------------|-----------------|
| `api-node` | container | 3000 |
| `worker-python` | container | 8000 (health opcional) |
| `web` | container ou dev server | 5173 (dev) / 80 (prod Nginx) |
| PostgreSQL | container | 5432 |
| Redis | container | 6379 |

**Compose** com API, worker, bases de dados e filas: **planeado** em `infra/docker/` ou consolidação com Compose na raiz — ver [folder-structure.md](../07-standards/folder-structure.md). O Compose **atual** na raiz **não** substitui este alvo.

```mermaid
flowchart LR
  subgraph fullstack [Compose_alvo_M1]
    API[api-node]
    PY[worker-python]
    WEBS[web]
    PG[(postgres)]
    RD[(redis)]
  end
  DEV2[Clientes] --> WEBS
  DEV2 --> API
  API --> PG
  API --> RD
  PY --> PG
  PY --> RD
```

## Produção (diretrizes gerais)

- **Stateless** para `api-node` e `worker-python` (escala horizontal), quando existirem.  
- **PostgreSQL** gerenciado ou VM com backup.  
- **Redis** com persistência configurada se a fila exigir durabilidade (avaliar trade-off em ADR).  
- **Segredos** via vault/variáveis do ambiente — nunca no Git.

## Evolução

- **Kubernetes:** quando necessário escalar serviços independentemente; novo ADR para ingress, secrets e migrações.
