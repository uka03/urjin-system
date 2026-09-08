import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { UserModule } from 'user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from './strategies/access-token.strategy';

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
  ],
})
export class AuthModule {}
