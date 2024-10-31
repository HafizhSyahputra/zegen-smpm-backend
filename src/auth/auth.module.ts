import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { AuditService } from '@smpm/audit/audit.service';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AuditService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
