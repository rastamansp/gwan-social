# Gwan Social — API (`apps/api`)

NestJS + Prisma + fixtures JSON. Ver README na raiz do monorepo para visão geral.

## Testes BDD (Cucumber)

```bash
cd apps/api
npm run test:bdd
```

**Requisitos**

- `DATABASE_URL` em `.env` (PostgreSQL acessível a partir da tua máquina).
- Migrations aplicadas (`npx prisma migrate deploy`) se os cenários de auth falharem por esquema.

**Se o comando “fica preso” sem output**

- O arranque chama o Prisma (`$connect`). Sem `connect_timeout` na URL do Postgres, o cliente pode esperar muito tempo se o host não responde.
- Os testes injetam `connect_timeout` (por omissão 10s) na `DATABASE_URL` em memória; podes fixar na própria URL: `?connect_timeout=10`.
- Variáveis opcionais: `BDD_PG_CONNECT_TIMEOUT_SEC`, `BDD_APP_INIT_TIMEOUT_MS` (limite extra ao `app.init()`).
- Confirma que o Postgres está a escutar e que firewall/VPN permitem a ligação.

**Nota:** Com `npm run dev:api` ao mesmo tempo, em geral não há conflito (cliente de teste vs servidor), mas se algo falhar, tenta parar o dev server e volta a correr `test:bdd`.
