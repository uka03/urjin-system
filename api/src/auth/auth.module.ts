import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { UserModule } from 'user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy],
  imports: [
    PrismaModule,
    UserModule,
    JwtModule.register({}),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 5,
          blockDuration: 60_000,
        },
      ],
      errorMessage:
        'Хэт олон оролдолго хийсэн байна. 60сек хүлээгээд дахин оролдоно уу',
    }),
  ],
})
export class AuthModule {}
