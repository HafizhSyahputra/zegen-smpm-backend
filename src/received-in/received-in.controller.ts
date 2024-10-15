// src/received-in/received-in.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ReceivedInService } from './received-in.service';
import { ReceivedInEntity } from './entities/received-in.entity';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { Request } from 'express';
import { AuditService } from '@smpm/audit/audit.service';
import { PageOptionReceivedInDto } from './dto/page-option.dto';
import { CreateReceivedInDto } from './dto/create-received-in.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { ApproveReceivedInDto } from './dto/approve-received-in.dto';
import { NotificationCategory } from '../common/constants/enum';

@UseGuards(AccessTokenGuard)
@Controller('received-in')
export class ReceivedInController {
  constructor(
    private readonly receivedInService: ReceivedInService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  async create(
    @Body() createReceivedInDto: CreateReceivedInDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<ReceivedInEntity> {
    const create = await this.receivedInService.create(createReceivedInDto);

    // Create audit log
    await this.auditService.create({
      Url: req.url,
      ActionName: 'Create ReceivedIn',
      MenuName: 'ReceivedIn',
      DataBefore: '',
      DataAfter: JSON.stringify(create),
      UserName: user.name,
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user.sub,
      updated_by: user.sub,
    });

    // Create and send notification
    await this.notificationsService.createNotification(
      user.sub,
      'ReceivedIn Dibuat',
      `ReceivedIn dengan ID ${create.id} telah dibuat oleh ${user.name} pada ${new Date().toLocaleString()}. Data detail: ${JSON.stringify(create)}.`,
      NotificationCategory.CREATE, // Use enum for category
      user.sub,
      `/received-in/${create.id}`, // Link to the specific ReceivedIn
    );

    return new ReceivedInEntity(create);
  }

  @Get()
  async findAll(
    @Query() pageOptionReceivedInDto: PageOptionReceivedInDto,
  ): Promise<PageDto<ReceivedInEntity>> {
    const data = await this.receivedInService.findAll(pageOptionReceivedInDto);
    data.data = data.data.map(
      (item) =>
        new ReceivedInEntity({
          ...item,
        }),
    );
    return data;
  }

  @Get(':id')
  async findOne(@Param() param: ParamIdDto): Promise<ReceivedInEntity> {
    const find = await this.receivedInService.findOne(param.id);
    if (!find) throw new BadRequestException('Data tidak ditemukan.');
    return new ReceivedInEntity(find);
  }

  @Patch(':id/approve')
  async approve(
    @Param() param: ParamIdDto,
    @Body() approveReceivedInDto: ApproveReceivedInDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<ReceivedInEntity> {
    const find = await this.receivedInService.findOne(param.id);
    if (!find) throw new BadRequestException('Data tidak ditemukan.');

    if (find.status !== 'waiting') {
      throw new BadRequestException('Hanya ReceivedIn dengan status "waiting" yang dapat disetujui.');
    }

    const approved = await this.receivedInService.approve(param.id, approveReceivedInDto);

    // Create audit log
    await this.auditService.create({
      Url: req.url,
      ActionName: 'Approve ReceivedIn',
      MenuName: 'ReceivedIn',
      DataBefore: JSON.stringify(find),
      DataAfter: JSON.stringify(approved),
      UserName: user.name,
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user.sub,
      updated_by: user.sub,
    });

    // Create and send notification
    await this.notificationsService.createNotification(
      user.sub,
      'ReceivedIn Disetujui',
      `ReceivedIn dengan ID ${approved.id} telah disetujui oleh ${user.name} pada ${new Date().toLocaleString()}. Data detail disetujui: ${JSON.stringify(approved)}.`,
      NotificationCategory.APPROVE, // Use enum for category
      user.sub,
      `/received-in/${approved.id}`, // Link to the specific ReceivedIn
    );

    return new ReceivedInEntity(approved);
  }

  @Delete(':id')
  async remove(
    @Param() param: ParamIdDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<void> {
    const find = await this.receivedInService.findOne(param.id);
    if (!find) throw new BadRequestException('Data tidak ditemukan.');

    await this.receivedInService.remove(param.id);

    // Create audit log
    await this.auditService.create({
      Url: req.url,
      ActionName: 'Delete ReceivedIn',
      MenuName: 'ReceivedIn',
      DataBefore: JSON.stringify(find),
      DataAfter: '',
      UserName: user.name,
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user.sub,
      updated_by: user.sub,
    });

    // Create and send notification
    await this.notificationsService.createNotification(
      user.sub,
      'ReceivedIn Dihapus',
      `ReceivedIn dengan ID ${param.id} telah dihapus oleh ${user.name} pada ${new Date().toLocaleString()}. Data detail yang dihapus: ${JSON.stringify(find)}.`,
      NotificationCategory.DELETE, // Use enum for category
      user.sub,
      `/received-in/${param.id}`, // Link to the specific ReceivedIn
    );
  }

  private getBrowserFromUserAgent(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    return 'Unknown';
  }

  private getOSFromUserAgent(userAgent: string, request: Request): string {
    const testOS = request.headers['x-test-os'];
    if (/PostmanRuntime/i.test(userAgent))
      return 'Postman (Testing Environment)';
    if (testOS) return testOS as string;
    if (userAgent.includes('Win')) return 'Windows';
    if (userAgent.includes('Mac')) return 'MacOS';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Unknown';
  }
}