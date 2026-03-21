import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { parseJwtExpiresSec } from '../config'
import { ApplicationModule } from '../application/application.module'
import { InfrastructureModule } from '../infrastructure/infrastructure.module'
import { PrismaModule } from '../infrastructure/prisma/prisma.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { MeService } from './me.service'

function jwtSecret(config: ConfigService): string {
  const s = config.get<string>('JWT_SECRET')
  if (s && s.length >= 32) return s
  if (process.env.NODE_ENV !== 'production') {
    return 'dev-only-min-32-chars-jwt-secret-change-me!!'
  }
  throw new Error('JWT_SECRET must be set (min. 32 caracteres).')
}

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    InfrastructureModule,
    ApplicationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: jwtSecret(config),
        signOptions: {
          expiresIn: parseJwtExpiresSec(config.get<string>('JWT_ACCESS_EXPIRES_SEC'), 900),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MeService],
  exports: [AuthService, MeService, JwtModule],
})
export class AuthModule {}
