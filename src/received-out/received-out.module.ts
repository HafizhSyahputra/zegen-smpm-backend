
// src/received-out/received-out.module.ts

import { Module } from '@nestjs/common';
import { ReceivedOutService } from './received-out.service';
import { ReceivedOutController } from './received-out.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditService } from '@smpm/audit/audit.service';
import { MediaService } from '@smpm/media/media.service';
import { JobOrderService } from '@smpm/job-order/job-order.service';
import { NotificationsModule } from '@smpm/notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [ReceivedOutService, AuditService, MediaService, JobOrderService],
  controllers: [ReceivedOutController],
})
export class ReceivedOutModule {}
