# Padrões de API (REST)

## Objetivo

Padronizar a API HTTP exposta pelo **`api-node`** para `web` e `mobile`.

## Base URL e versionamento

- Prefixo: `/v1` para todos os recursos estáveis.  
- **Quebra compatível:** novo prefixo `/v2` ou negociação por header — documentar em ADR.

## Formato de resposta de sucesso

```json
{
  "data": {},
  "meta": { "request_id": "uuid" }
}
```

## Erros

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
| **JWT Bearer** (`Authorization: Bearer <token>`) | **Recomendada** no MVP |
| OIDC / OAuth2 com provedor externo | Alternativa futura (ADR) |

## Paginação

- `?cursor=` ou `?page=&page_size=` — escolher um padrão na ETAPA 2 e manter consistente em todos os list endpoints.

## Idempotência

- Operações sensíveis (ex.: reenvio) podem exigir header `Idempotency-Key` — introduzir com ADR se necessário.

## OpenAPI

- Gerar especificação OpenAPI a partir do Nest (Swagger) na ETAPA 2; publicar artefato por release.
