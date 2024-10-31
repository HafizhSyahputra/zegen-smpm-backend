// src/received-in/received-in.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { ReceivedInService } from './received-in.service';
import { ReceivedInController } from './received-in.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditService } from '@smpm/audit/audit.service';
import { NotificationsModule } from '@smpm/notifications/notifications.module';
import { NotificationsService } from '@smpm/notifications/notifications.service';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { UserService } from '@smpm/user/user.service';
import { AuthModule } from '@smpm/auth/auth.module';
import { ElectronicDataCaptureModule } from '@smpm/electronic-data-capture/electronic-data-capture.module'; // Import ElectronicDataCaptureModule

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    AuthModule,
    forwardRef(() => ElectronicDataCaptureModule), // Use forwardRef if there's a circular dependency
  ],
  providers: [ReceivedInService, AuditService, NotificationsService, UserService],
  controllers: [ReceivedInController],
  exports: [ReceivedInService],
})
export class ReceivedInModule {}