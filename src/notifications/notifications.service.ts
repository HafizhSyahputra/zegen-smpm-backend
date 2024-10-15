// src/notifications/notifications.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationCategory } from '../common/constants/enum';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createNotification(
    iduser: number,
    title: string,
    detail: string,
    category: NotificationCategory,
    createdBy?: number, // Optional parameter for created_by
    link: string = '#',  // Default link value
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        user: { connect: { id: iduser } },
        title,
        detail,
        category,
        read: false, // Default value for read
        link,        // Link value
        created_by: createdBy, // Set created_by if provided
      },
    });

    this.eventEmitter.emit('notification.created', notification);

    return notification;
  }

  async getNotificationsByUser(iduser: number) {
    return this.prisma.notification.findMany({
      where: { iduser },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: number, userId: number) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readat: new Date(),
        updated_by: userId,
      },
    });
  }
}