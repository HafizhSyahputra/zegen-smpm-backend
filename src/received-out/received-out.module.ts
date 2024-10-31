// src/received-out/received-out.module.ts  

import { Module } from '@nestjs/common';  
import { ReceivedOutService } from './received-out.service';  
import { ReceivedOutController } from './received-out.controller';  
import { PrismaModule } from '@smpm/prisma/prisma.module';  
import { AuditService } from '@smpm/audit/audit.service';  
import { MediaService } from '@smpm/media/media.service';  
import { JobOrderService } from '@smpm/job-order/job-order.service';  
import { NotificationsModule } from '@smpm/notifications/notifications.module';  
import { UserService } from '@smpm/user/user.service';  
import { NotificationsService } from '@smpm/notifications/notifications.service';  
import { AuthModule } from '@smpm/auth/auth.module'; // Tambahkan import ini  

@Module({  
  imports: [  
    PrismaModule,   
    NotificationsModule,  
    AuthModule, // Tambahkan AuthModule ke imports  
  ],  
  providers: [  
    ReceivedOutService,   
    AuditService,   
    MediaService,   
    JobOrderService,   
    UserService,   
    NotificationsService  
  ],  
  controllers: [ReceivedOutController],  
  exports: [ReceivedOutService],  
})  
export class ReceivedOutModule {}