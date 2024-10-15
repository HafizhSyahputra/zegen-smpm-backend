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
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { Request } from 'express';
import { AuditService } from '@smpm/audit/audit.service';
import { PageOptionReceivedOutDto } from './dto/page-option.dto';
import { CreateReceivedOutDto } from './dto/create-received-out.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationCategory } from '../common/constants/enum';
import { ReceivedOutResponseDto } from './dto/received-out-response.dto';
import { ApproveReceivedOutDto } from './dto/approve-received-out.dto';

@UseGuards(AccessTokenGuard)
@Controller('received-out')
export class ReceivedOutController {
  constructor(
    private readonly receivedOutService: ReceivedOutService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
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
      user.sub,
      'ReceivedOut Created',
      `ReceivedOut with ID ${create.id} has been created by ${user.name} on ${new Date().toLocaleString()}. Detailed data: ${JSON.stringify(create)}.`,
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
    if (!find) throw new BadRequestException('Data not found.');
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
    if (!find) throw new BadRequestException('Data not found.');

    const oldData = await this.receivedOutService.findOne(Number(param.id));
    const update = await this.receivedOutService.update(
      param.id,
      updateReceivedOutDto,
    );

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
      user.sub,
      'ReceivedOut Updated',
      `ReceivedOut with ID ${update.id} has been updated by ${user.name} on ${new Date().toLocaleString()}. New data: ${JSON.stringify(update)}. Old data: ${JSON.stringify(oldData)}.`,
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
    if (!find) throw new BadRequestException('Data not found.');

    // Approve the item
    const approved = await this.receivedOutService.update(param.id, {
      status: 'approved',
      approved_by: user.sub,
      updated_by: user.sub,
    });

    // Create audit log
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

    // Create and send notification
    await this.notificationsService.createNotification(
      user.sub,
      'ReceivedOut Approved',
      `ReceivedOut with ID ${approved.id} has been approved by ${user.name} on ${new Date().toLocaleString()}. Approved data: ${JSON.stringify(approved)}.`,
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
          user.sub,
          'Bulk Approved ReceivedOut',
          `ReceivedOut with ID ${id} has been bulk approved by ${user.name} on ${new Date().toLocaleString()}.`,
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
          user.sub,
          'Bulk Rejected ReceivedOut',
          `ReceivedOut with ID ${id} has been bulk rejected by ${user.name} on ${new Date().toLocaleString()}.`,
          NotificationCategory.BULK_REJECT, // Use enum for category
          user.sub,
          `/received-out/${id}`, // Link to the specific ReceivedOut
        );
      }),
    );

    return { count: result.count };
  }

  /**
   * Delete a ReceivedOut by ID
   */
  @Delete(':id')
  async remove(
    @Param() param: ParamIdDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<void> {
    const find = await this.receivedOutService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    await this.receivedOutService.remove(param.id);

    // Create audit log
    await this.auditService.create({
      Url: req.url,
      ActionName: 'Delete ReceivedOut',
      MenuName: 'ReceivedOut',
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
      'ReceivedOut Deleted',
      `ReceivedOut with ID ${param.id} has been deleted by ${user.name} on ${new Date().toLocaleString()}. Deleted data: ${JSON.stringify(find)}.`,
      NotificationCategory.DELETE, // Use enum for category
      user.sub,
      `/received-out/${param.id}`, // Link to the specific ReceivedOut
    );
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