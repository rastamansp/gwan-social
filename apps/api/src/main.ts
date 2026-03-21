import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { AppModule } from './app.module'
import { parseCorsOrigins, parsePort, publicApiBase } from './config'
import { httpLoggingMiddleware } from './presentation/http/http-logging.middleware'
import { FixtureReadModelAdapter } from './infrastructure/fixtures/fixture-read-model.adapter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(httpLoggingMiddleware)
  const config = app.get(ConfigService)

  const port = parsePort(config.get<string>('PORT'))
  const publicBase = publicApiBase(port, config.get<string>('PUBLIC_API_URL'))
  const corsOrigins = parseCorsOrigins(config.get<string>('CORS_ORIGINS'))

  app.enableCors({ origin: corsOrigins, credentials: true })
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Gwan Social API (fixtures)')
    .setDescription(
      'API REST de demonstração: lê gwan-social.fixtures.json e expõe o read model hidratado (paginação por cursor).',
    )
    .setVersion('0.1.0')
    .addServer(publicBase)
    .addTag('Sistema')
    .addTag('Feed e posts')
    .addTag('Sessão')
    .addTag('Utilizadores')
    .addTag('Autenticação')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)

  const expressApp = app.getHttpAdapter().getInstance()
  const fixtures = app.get(FixtureReadModelAdapter)

  /** Antes do UI em `/api/*` para não ser interceptado pelo static do Swagger. */
  expressApp.get('/api/openapi.json', (_req: Request, res: Response) => {
    res.json(document)
  })

  SwaggerModule.setup('api/', app, document, {
    customSiteTitle: 'Gwan Social API (fixtures)',
    customCss: '.swagger-ui .topbar { display: none }',
    useGlobalPrefix: false,
  })

  expressApp.get('/', (_req: Request, res: Response) => {
    res.json({
      service: 'gwan-social-api',
      swaggerUi: `${publicBase}/api/`,
      openApiJson: `${publicBase}/api/openapi.json`,
      health: `${publicBase}/api/v1/health`,
      fixturesPath: fixtures.getFixturesFilePath(),
    })
  })

  /** Sem barra final, o browser resolve mal os assets relativos do Swagger UI. */
  expressApp.get('/api', (req: Request, res: Response) => {
    const q = req.url.indexOf('?')
    if (q === -1) {
      res.redirect(302, '/api/')
      return
    }
    res.redirect(302, `/api/?${req.url.slice(q + 1)}`)
  })

  process.on('SIGUSR2', () => {
    fixtures.resetCache()
  })

  await app.listen(port)
  console.info(`[api] http://localhost:${port}`)
  console.info(`[api] swagger: http://localhost:${port}/api/`)
  console.info(`[api] fixtures: ${fixtures.getFixturesFilePath()}`)
}

bootstrap().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
