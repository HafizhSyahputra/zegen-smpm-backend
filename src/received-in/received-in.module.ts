import { Module } from '@nestjs/common';
import { ReceivedInService } from './received-in.service';
import { ReceivedInController } from './received-in.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditService } from '@smpm/audit/audit.service';
import { NotificationsModule } from '@smpm/notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [ReceivedInService, AuditService],
  controllers: [ReceivedInController],
})
export class ReceivedInModule {}