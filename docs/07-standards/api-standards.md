# Padrões de API (REST)

## Objetivo

Padronizar a API HTTP exposta por **`apps/api`** (NestJS) para `web` e `mobile`.

## Base URL e versionamento

- **Prefixo global (implementado):** `/api/v1` para recursos REST estáveis da API Nest (ex.: `GET /api/v1/health`).  
- **Alvo normativo:** manter um único prefixo versionado por release; **quebra compatível:** novo segmento (`/api/v2`, etc.) ou negociação por header — documentar em ADR.

## Autenticação (as-implemented)

- **Registo / login:** `POST /api/v1/auth/register`, `POST /api/v1/auth/login` — passwords com Argon2id; respostas incluem `accessToken`, `refreshToken`, `expiresIn`, `tokenType`.  
- **Refresh / logout:** `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout` (corpo JSON com `refreshToken`).  
- **Sessão:** `GET /api/v1/me` com cabeçalho `Authorization: Bearer <accessToken>` devolve o perfil do utilizador na base; sem token, **`401`**.  
- **Segredos:** `JWT_SECRET` (mín. 32 caracteres em produção), tempos em `JWT_ACCESS_EXPIRES_SEC` / `JWT_REFRESH_EXPIRES_SEC` — ver [`apps/api/.env.example`](../../apps/api/.env.example).  
- **Rate limit:** rotas `/auth/*` com limite mais estrito (throttle global + override por controlador).

## Descoberta e documentação (as-is)

| Artefato | Caminho |
|----------|---------|
| **OpenAPI JSON** | `GET /api/openapi.json` |
| **Swagger UI** | `GET /api/` (redirecionamento de `/api` para barra final) |
| **Raiz** | `GET /` — JSON com links (`swaggerUi`, `openApiJson`, `health`) |

Gerado com **`@nestjs/swagger`** em `apps/api`; publicar artefato por release quando a API for de produção.

## As-is vs alvo normativo (envelope e erros)

A API (`apps/api`) devolve **JSON direto** em sucesso (listas paginadas, DTOs). Para **erros HTTP**, usa o **corpo padrão do Nest** ao lançar exceções HTTP (ex.: `{ "statusCode": 404, "message": "…", "error": "Not Found" }`). O **alvo** envelope abaixo aplica-se à evolução para API de produto uniformizada:

## Formato de resposta de sucesso (alvo)

```json
{
  "data": {},
  "meta": { "request_id": "uuid" }
}
```

## Erros (alvo)

```json
{
  "error": {
    "code": "RATING_NOT_ALLOWED",
    "message": "Human readable message",
    "details": {}
  },
  "meta": { "request_id": "uuid" }
}
```

- Códigos HTTP semânticos (400, 401, 403, 404, 409, 422, 429, 500).  
- **`code`** estável para clientes; **`message`** pode mudar.

## Autenticação

| Abordagem | Status |
|-----------|--------|
| **JWT Bearer** (`Authorization: Bearer <token>`) | **Implementada** em rotas protegidas (`/me`, posts do utilizador, etc.) |
| OIDC / OAuth2 com provedor externo | Alternativa futura (ADR) |

## Paginação

- **As-is:** `?cursor=` e `?limit=` nos list endpoints — ver OpenAPI.  
- **Alvo:** um padrão único (`cursor` ou `page`/`page_size`) em todos os list endpoints; consolidar com ADR se necessário.

## Idempotência

- Operações sensíveis (ex.: reenvio) podem exigir header `Idempotency-Key` — introduzir com ADR se necessário.

## OpenAPI

- **Implementado** para `apps/api` (Nest Swagger). Incluir artefato versionado em releases quando sair do modo demonstração.
