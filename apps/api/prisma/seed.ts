/**
 * Entrada do Prisma (`prisma db seed`). Lógica modular em `./seeds/`.
 */
import { PrismaClient } from '@prisma/client'
import { runAllSeeds } from './seeds/runAllSeeds'

const prisma = new PrismaClient()

runAllSeeds(prisma)
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
