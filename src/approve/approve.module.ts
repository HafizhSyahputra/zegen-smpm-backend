import { Module } from '@nestjs/common';
import { ApproveService } from './approve.service';
import { ApproveController } from './approve.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditService } from '@smpm/audit/audit.service';
import { MediaService } from '@smpm/media/media.service';
import { JobOrderService } from '@smpm/job-order/job-order.service';

@Module({
  imports:[PrismaModule],
  providers: [ApproveService, AuditService, MediaService, JobOrderService],
  controllers: [ApproveController]
})
export class ApproveModule {}
