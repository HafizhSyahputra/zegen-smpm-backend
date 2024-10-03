import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditService } from '@smpm/audit/audit.service';

@Module({
  imports: [PrismaModule],
  controllers: [RoleController],
  providers: [RoleService, AuditService],
})
export class RoleModule {}
