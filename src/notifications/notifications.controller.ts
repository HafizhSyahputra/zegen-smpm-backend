// src/notifications/notifications.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Endpoint untuk mengambil notifikasi berdasarkan ID pengguna
  @Get(':iduser')
  async getNotifications(@Param('iduser') iduser: number) {
    return this.notificationsService.getNotificationsByUser(iduser);
  }
}