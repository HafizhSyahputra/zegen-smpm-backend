// src/notifications/notifications.controller.ts

import { Controller, Get, Param, Post, Body, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationCategory } from '../common/constants/enum';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Endpoint untuk membuat notifikasi baru dan menghubungkannya ke role tertentu.
   * @param body Payload notifikasi.
   */
  @Post()
  async createNotification(@Body() body: {
    roleIds: number[];
    title: string;
    detail: string;
    category: NotificationCategory;
    createdBy?: number;
    link?: string;
  }) {
    const { roleIds, title, detail, category, createdBy, link } = body;
    return this.notificationsService.createNotification(
      roleIds,
      title,
      detail,
      category,
      createdBy,
      link,
    );
  }

  /**
   * Endpoint untuk mengambil notifikasi berdasarkan ID pengguna.
   * @param iduser ID pengguna
   */
  @Get(':iduser')
  async getNotifications(@Param('iduser') iduser: string) {
    const userId = parseInt(iduser, 10);
    if (isNaN(userId)) {
      throw new Error('Invalid user ID.');
    }
    return this.notificationsService.getNotificationsByUser(userId);
  }

  /**
   * Endpoint untuk menandai notifikasi sebagai telah dibaca oleh pengguna.
   * @param body Payload yang berisi userId dan notificationId
   */
  @Patch('mark-as-read')
  async markAsRead(@Body() body: { userId: number; notificationId: number }) {
    const { userId, notificationId } = body;
    return this.notificationsService.markAsRead(notificationId, userId);
  }
}