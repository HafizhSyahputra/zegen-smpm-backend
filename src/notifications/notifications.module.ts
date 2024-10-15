// src/notifications/notifications.module.ts

import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    PrismaModule,
    EventEmitterModule.forRoot(),
    // Modifikasi impor lainnya jika diperlukan
  ],
  providers: [
    NotificationsService,
    NotificationsGateway,
    {
      provide: EventEmitter2,
      useFactory: () => new EventEmitter2(),
    },
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService], // Pastikan NotificationsService diekspor
})
export class NotificationsModule {}