import { Module } from '@nestjs/common';
import { ApproveService } from './approve.service';
import { ApproveController } from './approve.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditService } from '@smpm/audit/audit.service';

@Module({
  imports:[PrismaModule],
  providers: [ApproveService, AuditService],
  controllers: [ApproveController]
})
export class ApproveModule {}
