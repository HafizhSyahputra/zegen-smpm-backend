// src/received-out/received-out.controller.ts

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
import { ReceivedOutService } from './received-out.service';
import { ReceivedOutResponseDto } from './dto/received-out-response.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { Request } from 'express';
import { AuditService } from '@smpm/audit/audit.service';
import { PageOptionReceivedOutDto } from './dto/page-option.dto';
import { CreateReceivedOutDto } from './dto/create-received-out.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { ApproveReceivedOutDto } from './dto/approve-received-out.dto';
import { NotificationCategory } from '../common/constants/enum';
import { UserService } from '../user/user.service'; // Import UserService

@UseGuards(AccessTokenGuard)
@Controller('received-out')
export class ReceivedOutController {
  constructor(
    private readonly receivedOutService: ReceivedOutService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
    private readonly userService: UserService, // Inject UserService
  ) {}

  /**
   * Get ReceivedOut statistics
   */
  @Get('statistics')
  async getReceivedOutStatistics(): Promise<{
    waiting: number;
    approved: number;
    rejected: number;
  }> {
    return this.receivedOutService.getReceivedOutStatistics();
  }

  /**
   * Get all waiting ReceivedOut items
   */
  @Get('waiting')
  async getWaitingReceivedOuts(
    @Query() pageOptionReceivedOutDto: PageOptionReceivedOutDto,
  ): Promise<PageDto<ReceivedOutResponseDto>> {
    const data = await this.receivedOutService.getWaitingReceivedOuts(
      pageOptionReceivedOutDto,
    );
    const mappedData = data.data.map(
      (item) => item as ReceivedOutResponseDto,
    );
    return new PageDto(mappedData, data.meta);
  }

  /**
   * Create a new ReceivedOut
   */
  @Post()
  async create(
    @Body() createReceivedOutDto: CreateReceivedOutDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<ReceivedOutResponseDto> {
    const create = await this.receivedOutService.create(createReceivedOutDto);

    // Fetch user's role ID
    const userData = await this.userService.findOne(user.sub);
    if (!userData) {
      throw new BadRequestException('User tidak ditemukan.');
    }
    const roleIds = [3, 7];

    // Create audit log
    await this.auditService.create({
      Url: req.url,
      ActionName: 'Create ReceivedOut',
      MenuName: 'ReceivedOut',
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
      roleIds, // Pass array of role IDs
      'ReceivedOut Dibuat',
      `ReceivedOut dengan ID ${create.id} telah dibuat oleh ${user.name} pada ${new Date().toLocaleString()}. Data detail: ${JSON.stringify(create)}.`,
      NotificationCategory.CREATE, // Use enum for category
      user.sub,
      `/received-out/${create.id}`, // Link to the specific ReceivedOut
    );

    return create as ReceivedOutResponseDto;
  }

  /**
   * Get all ReceivedOut items with pagination and filtering
   */
  @Get()
  async findAll(
    @Query() pageOptionReceivedOutDto: PageOptionReceivedOutDto,
  ): Promise<PageDto<ReceivedOutResponseDto>> {
    const data = await this.receivedOutService.findAll(
      pageOptionReceivedOutDto,
    );
    const mappedData = data.data.map(
      (item) => item as ReceivedOutResponseDto,
    );
    return new PageDto(mappedData, data.meta);
  }

  /**
   * Get a single ReceivedOut by ID
   */
  @Get(':id')
  async findOne(@Param() param: ParamIdDto): Promise<ReceivedOutResponseDto> {
    const find = await this.receivedOutService.findOne(param.id);
    if (!find) throw new BadRequestException('Data tidak ditemukan.');
    return find as ReceivedOutResponseDto;
  }

  /**
   * Update a ReceivedOut by ID
   */
  @Patch(':id')
  async update(
    @Param() param: ParamIdDto,
    @Body() updateReceivedOutDto: CreateReceivedOutDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<ReceivedOutResponseDto> {
    const find = await this.receivedOutService.findOne(param.id);
    if (!find) throw new BadRequestException('Data tidak ditemukan.');

    const oldData = await this.receivedOutService.findOne(Number(param.id));
    const update = await this.receivedOutService.update(
      param.id,
      updateReceivedOutDto,
    );

    // Fetch user's role ID
    const userData = await this.userService.findOne(user.sub);
    if (!userData) {
      throw new BadRequestException('User tidak ditemukan.');
    }
    const roleIds = [3, 7];

    // Create audit log
    await this.auditService.create({
      Url: req.url,
      ActionName: 'Update ReceivedOut',
      MenuName: 'ReceivedOut',
      DataBefore: JSON.stringify(oldData),
      DataAfter: JSON.stringify(update),
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
      roleIds, // Pass array of role IDs
      'ReceivedOut Diperbarui',
      `ReceivedOut dengan ID ${update.id} telah diperbarui oleh ${user.name} pada ${new Date().toLocaleString()}. Data baru: ${JSON.stringify(update)}. Data lama: ${JSON.stringify(oldData)}.`,
      NotificationCategory.UPDATE, // Use enum for category
      user.sub,
      `/received-out/${update.id}`, // Link to the specific ReceivedOut
    );

    return update as ReceivedOutResponseDto;
  }

  /**
   * Approve a ReceivedOut by ID
   */
  @Patch(':id/approve')
  async approveItem(
    @Param() param: ParamIdDto,
    @Body() approveReceivedOutDto: ApproveReceivedOutDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<ReceivedOutResponseDto> {
    const find = await this.receivedOutService.findOne(param.id);
    if (!find) throw new BadRequestException('Data tidak ditemukan.');

    // Approve the item menggunakan metode baru di service
    const approved = await this.receivedOutService.approve(param.id, approveReceivedOutDto, user.sub);

    // Fetch user's role ID
    const userData = await this.userService.findOne(user.sub);
    if (!userData) {
      throw new BadRequestException('User tidak ditemukan.');
    }
    const roleIds = [3, 7];

    // Buat audit log
    await this.auditService.create({
      Url: req.url,
      ActionName: 'Approve ReceivedOut',
      MenuName: 'ReceivedOut',
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

    // Buat dan kirim notifikasi
    await this.notificationsService.createNotification(
      roleIds, // Pass array of role IDs
      'ReceivedOut Disetujui',
      `ReceivedOut dengan ID ${approved.id} telah disetujui oleh ${user.name} pada ${new Date().toLocaleString()}. Data yang disetujui: ${JSON.stringify(approved)}.`,
      NotificationCategory.APPROVE, // Use enum for category
      user.sub,
      `/received-out/${approved.id}`, // Link to the specific ReceivedOut
    );

    return approved as ReceivedOutResponseDto;
  }

  /**
   * Bulk approve ReceivedOut items
   */
  @Post('bulk-approve')
  async bulkApprove(
    @Body('ids') ids: number[],
    @User() user: any,
    @Req() req: Request,
  ): Promise<{ count: number }> {
    console.log('Received IDs:', ids);
    const result = await this.receivedOutService.bulkApprove(ids);

    // Fetch user's role ID
    const userData = await this.userService.findOne(user.sub);
    if (!userData) {
      throw new BadRequestException('User tidak ditemukan.');
    }
    const roleIds = [3, 7];

    // Create audit log
    await this.auditService.create({
      Url: req.url,
      ActionName: 'Bulk Approve ReceivedOut',
      MenuName: 'ReceivedOut',
      DataBefore: JSON.stringify(ids),
      DataAfter: JSON.stringify(result),
      UserName: user.name,
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user.sub,
      updated_by: user.sub,
    });

    // Create and send notifications for each bulk approved item
    await Promise.all(
      ids.map(async (id) => {
        await this.notificationsService.createNotification(
          roleIds, // Pass array of role IDs
          'ReceivedOut Disetujui secara Massal',
          `ReceivedOut dengan ID ${id} telah disetujui secara massal oleh ${user.name} pada ${new Date().toLocaleString()}.`,
          NotificationCategory.BULK_APPROVE, // Use enum for category
          user.sub,
          `/received-out/${id}`, // Link to the specific ReceivedOut
        );
      }),
    );

    return { count: result.count };
  }

  /**
   * Bulk reject ReceivedOut items
   */
  @Post('bulk-reject')
  async bulkReject(
    @Body('ids') ids: number[],
    @User() user: any,
    @Req() req: Request,
  ): Promise<{ count: number }> {
    console.log('Received IDs for Rejection:', ids);
    const result = await this.receivedOutService.bulkReject(ids);

    // Fetch user's role ID
    const userData = await this.userService.findOne(user.sub);
    if (!userData) {
      throw new BadRequestException('User tidak ditemukan.');
    }
    const roleIds = [3, 7];

    // Create audit log
    await this.auditService.create({
      Url: req.url,
      ActionName: 'Bulk Reject ReceivedOut',
      MenuName: 'ReceivedOut',
      DataBefore: JSON.stringify(ids),
      DataAfter: JSON.stringify(result),
      UserName: user.name,
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user.sub,
      updated_by: user.sub,
    });

    // Create and send notifications for each bulk rejected item
    await Promise.all(
      ids.map(async (id) => {
        await this.notificationsService.createNotification(
          roleIds, // Pass array of role IDs
          'ReceivedOut Ditolak secara Massal',
          `ReceivedOut dengan ID ${id} telah ditolak secara massal oleh ${user.name} pada ${new Date().toLocaleString()}.`,
          NotificationCategory.BULK_REJECT, // Use enum for category
          user.sub,
          `/received-out/${id}`, // Link to the specific ReceivedOut
        );
      }),
    );

    return { count: result.count };
  }

  /**
   * Helper method to extract browser information from User-Agent
   */
  private getBrowserFromUserAgent(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    return 'Unknown';
  }

  /**
   * Helper method to extract OS information from User-Agent
   */
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