// src/notifications/notifications.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Membuat notifikasi dan memancarkan event
  async createNotification(iduser: number, title: string, detail: string) {
    const notification = await this.prisma.notification.create({
      data: {
        iduser,
        title,
        detail,
      },
    });

    // Emit event setelah notifikasi dibuat
    this.eventEmitter.emit('notification.created', notification);

    return notification;
  }

  // Mengambil semua notifikasi untuk pengguna tertentu
  async getNotificationsByUser(iduser: number) {
    return this.prisma.notification.findMany({
      where: { iduser },
      orderBy: { createdAt: 'desc' },
    });
  }
}