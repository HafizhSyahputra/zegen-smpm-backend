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

  /**
   * Membuat notifikasi dan menghubungkannya ke satu atau lebih role.
   * @param roleIds Array ID role yang akan menerima notifikasi
   * @param title Judul notifikasi
   * @param detail Detail notifikasi
   * @param category Kategori notifikasi
   * @param createdBy ID pengguna yang membuat notifikasi (opsional)
   * @param link Link terkait notifikasi (opsional)
   */
  async createNotification(
    roleIds: number[],
    title: string,
    detail: string,
    category: NotificationCategory,
    createdBy?: number, // Optional parameter for created_by
    link: string = '#',  // Default link value
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        title,
        detail,
        category,
        link,
        created_by: createdBy,
        RoleNotification: {
          create: roleIds.map((roleId) => ({
            role: { connect: { id: roleId } },
          })),
        },
      },
      include: {
        RoleNotification: {
          include: {
            role: true,
          },
        },
      },
    });

    this.eventEmitter.emit('notification.created', notification);

    return notification;
  }

  /**
   * Mengambil notifikasi berdasarkan ID pengguna.
   * Notifikasi diambil berdasarkan role pengguna.
   * @param userId ID pengguna
   */
  async getNotificationsByUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || !user.role) {
      throw new Error('User atau Role tidak ditemukan.');
    }

    const roleId = user.role.id;

    const notifications = await this.prisma.notification.findMany({
      where: {
        RoleNotification: {
          some: { roleId },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        RoleNotification: {
          include: {
            role: true,
          },
        },
        UserNotification: {
          where: { userId },
        },
      },
    });

    // Tambahkan logika untuk menyertakan status read per user
    return notifications.map((notification) => {
      const userNotification = notification.UserNotification[0];
      return {
        ...notification,
        read: userNotification ? userNotification.read : false,
        readAt: userNotification ? userNotification.readAt : null,
      };
    });
  }

  /**
   * Menandai notifikasi sebagai telah dibaca oleh pengguna tertentu.
   * @param notificationId ID notifikasi
   * @param userId ID pengguna
   */
  async markAsRead(notificationId: number, userId: number) {
    const existing = await this.prisma.userNotification.findUnique({
      where: {
        userId_notificationId: {
          userId,
          notificationId,
        },
      },
    });

    if (existing) {
      return this.prisma.userNotification.update({
        where: {
          userId_notificationId: {
            userId,
            notificationId,
          },
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    } else {
      return this.prisma.userNotification.create({
        data: {
          user: { connect: { id: userId } },
          notification: { connect: { id: notificationId } },
          read: true,
          readAt: new Date(),
        },
      });
    }
  }
}