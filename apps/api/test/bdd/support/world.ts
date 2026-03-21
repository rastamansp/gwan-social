import { World, type IWorldOptions } from '@cucumber/cucumber'
import type { Server } from 'node:http'

/** Estado partilhado entre steps (supertest + credenciais de cenário). */
export class ApiBddWorld extends World {
  server!: Server
  lastStatus!: number
  lastBody!: unknown
  /** Utilizador gerado no cenário de autenticação */
  testUsername?: string
  testPassword?: string
  accessToken?: string

  constructor(options: IWorldOptions) {
    super(options)
  }
}
