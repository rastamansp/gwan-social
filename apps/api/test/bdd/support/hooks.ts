import 'reflect-metadata'
import { AfterAll, Before, BeforeAll, setWorldConstructor } from '@cucumber/cucumber'
import { ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ThrottlerGuard } from '@nestjs/throttler'
import type { INestApplication } from '@nestjs/common'
import { AppModule } from '../../../src/app.module'
import { ApiBddWorld } from './world'
import { ensurePostgresConnectTimeout } from './database-url'

setWorldConstructor(ApiBddWorld)

let app: INestApplication
let httpServer: ReturnType<INestApplication['getHttpServer']>

const connectTimeoutSec = Number(process.env.BDD_PG_CONNECT_TIMEOUT_SEC ?? 10)
const initTimeoutMs = Number(process.env.BDD_APP_INIT_TIMEOUT_MS ?? 60_000)

function raceInit(p: Promise<unknown>, label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      reject(
        new Error(
          `${label} excedeu ${initTimeoutMs}ms. Verifica DATABASE_URL, rede/firewall e PostgreSQL acessível. ` +
            `Podes definir connect_timeout na URL (ex.: ?connect_timeout=10) ou BDD_APP_INIT_TIMEOUT_MS.`,
        ),
      )
    }, initTimeoutMs)
    p.then(() => {
      clearTimeout(t)
      resolve()
    }).catch((e: unknown) => {
      clearTimeout(t)
      reject(e)
    })
  })
}

BeforeAll({ timeout: initTimeoutMs + 120_000 }, async () => {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error(
      'DATABASE_URL não definida. Copia apps/api/.env.example para .env e configura PostgreSQL antes de npm run test:bdd.',
    )
  }

  ensurePostgresConnectTimeout(connectTimeoutSec)
  // eslint-disable-next-line no-console
  console.error(`[bdd] DATABASE_URL com connect_timeout=${connectTimeoutSec}s (evita bloqueio indefinido)`)

  // eslint-disable-next-line no-console
  console.error('[bdd] A compilar Nest TestingModule...')
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: () => true })
    .compile()

  app = moduleRef.createNestApplication()
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  // eslint-disable-next-line no-console
  console.error('[bdd] A inicializar app (Prisma $connect — pode demorar alguns segundos)...')
  await raceInit(app.init(), 'app.init()')
  httpServer = app.getHttpServer()
  // eslint-disable-next-line no-console
  console.error('[bdd] App pronta; a executar cenários.')
})

AfterAll(async () => {
  if (app) {
    await app.close()
  }
})

Before(function (this: ApiBddWorld) {
  this.server = httpServer
})
