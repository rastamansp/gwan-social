import { Logger } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'

const logger = new Logger('HTTP')

export function httpLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now()
  const path = req.originalUrl ?? req.url

  res.on('finish', () => {
    const ms = Date.now() - start
    logger.log(`${req.method} ${path} ${res.statusCode} +${ms}ms`)
  })

  next()
}
