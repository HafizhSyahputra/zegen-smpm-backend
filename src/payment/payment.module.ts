import { Module } from '@nestjs/common';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { AuditService } from '@smpm/audit/audit.service';
import { NotificationsService } from '@smpm/notifications/notifications.service';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { ReceivedOutModule } from '@smpm/received-out/received-out.module';

@Module({
    imports: [PrismaModule],
    controllers: [PaymentController],
    providers: [PaymentService,AuditService,NotificationsService, PrismaService, ReceivedOutModule,]
})

export class PaymentModule {}