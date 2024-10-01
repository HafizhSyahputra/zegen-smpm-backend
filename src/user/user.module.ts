import { Module } from '@nestjs/common';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { RoleService } from '@smpm/role/role.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '@smpm/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, RoleService, AuthService, JwtService],
  exports: [UserService],
})
export class UserModule {}
