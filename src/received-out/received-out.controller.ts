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
import { ReceivedOutResponseDto } from './dto/rececived-out-response.dto';
  
  @UseGuards(AccessTokenGuard)
  @Controller('received-out')
  export class ReceivedOutController {
    constructor(
      private readonly receivedOutService: ReceivedOutService,
      private readonly auditService: AuditService,
      private readonly notificationsService: NotificationsService,
    ) {}
  
    @Post()
    async create(
      @Body() createReceivedOutDto: CreateReceivedOutDto,
      @User() user: any,
      @Req() req: Request,
    ): Promise<ReceivedOutResponseDto> {
      const create = await this.receivedOutService.create(createReceivedOutDto);
  
      // Buat log audit
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
  
      // Buat dan kirim notifikasi dengan detail lebih lengkap
      await this.notificationsService.createNotification(
        user.sub, // ID pengguna
        'ReceivedOut Dibuat', // Judul notifikasi
        `ReceivedOut dengan ID ${create.id} telah dibuat oleh ${user.name} pada ${new Date().toLocaleString()}. Data detail: ${JSON.stringify(create)}.`,
      );
  
      return create as ReceivedOutResponseDto;
    }
  
    @Get()
    async findAll(
      @Query() pageOptionReceivedOutDto: PageOptionReceivedOutDto,
    ): Promise<PageDto<ReceivedOutResponseDto>> {
      const data = await this.receivedOutService.findAll(pageOptionReceivedOutDto);
      const mappedData = data.data.map(
        (item) => item as ReceivedOutResponseDto,
      );
      return new PageDto(mappedData, data.meta);
    }
  
    @Get(':id')
    async findOne(@Param() param: ParamIdDto): Promise<ReceivedOutResponseDto> {
      const find = await this.receivedOutService.findOne(param.id);
      if (!find) throw new BadRequestException('Data tidak ditemukan.');
      return find as ReceivedOutResponseDto;
    }
  
    @Patch(':id')
    async update(
      @Param() param: ParamIdDto,
      @Body() updateReceivedOutDto: CreateReceivedOutDto, // Gunakan DTO yang sesuai
      @User() user: any,
      @Req() req: Request,
    ): Promise<ReceivedOutResponseDto> {
      const find = await this.receivedOutService.findOne(param.id);
      if (!find) throw new BadRequestException('Data tidak ditemukan.');
  
      const oldData = await this.receivedOutService.findOne(Number(param.id));
      const update = await this.receivedOutService.update(param.id, updateReceivedOutDto);
  
      // Buat log audit
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
  
      // Buat dan kirim notifikasi dengan detail lebih lengkap
      await this.notificationsService.createNotification(
        user.sub,
        'ReceivedOut Diperbarui',
        `ReceivedOut dengan ID ${update.id} telah diperbarui oleh ${user.name} pada ${new Date().toLocaleString()}. Data detail baru: ${JSON.stringify(update)}. Data detail lama: ${JSON.stringify(oldData)}.`,
      );
  
      return update as ReceivedOutResponseDto;
    }
  
    @Patch(':id/approve')
    async approveItem(
      @Param() param: ParamIdDto,
      @User() user: any,
      @Req() req: Request,
    ): Promise<ReceivedOutResponseDto> {
      const find = await this.receivedOutService.findOne(param.id);
      if (!find) throw new BadRequestException('Data tidak ditemukan.');
  
      // Contoh fungsi approve jika dibutuhkan
      // Misalnya, mengubah status menjadi 'approved'
      const approved = await this.receivedOutService.update(param.id, {
        status: 'approved',
        approved_by: user.sub,
        updated_by: user.sub,
      });
  
      // Buat log audit
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
  
      // Buat dan kirim notifikasi dengan detail lebih lengkap
      await this.notificationsService.createNotification(
        user.sub,
        'ReceivedOut Disetujui',
        `ReceivedOut dengan ID ${approved.id} telah disetujui oleh ${user.name} pada ${new Date().toLocaleString()}. Data detail disetujui: ${JSON.stringify(approved)}.`,
      );
  
      return approved as ReceivedOutResponseDto;
    }
  
    @Post('bulk-approve')
    async bulkApprove(
      @Body('ids') ids: number[],
      @User() user: any,
      @Req() req: Request,
    ): Promise<{ count: number }> {
      console.log('Received IDs:', ids);
      const result = await this.receivedOutService.bulkApprove(ids);
  
      // Buat log audit
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
  
      // Buat dan kirim notifikasi untuk setiap ReceivedOut yang di-bulk
      await Promise.all(ids.map(async (id) => {
        await this.notificationsService.createNotification(
          user.sub,
          'Bulk Approve ReceivedOut',
          `ReceivedOut dengan ID ${id} telah di-bulk approve oleh ${user.name} pada ${new Date().toLocaleString()}.`,
        );
      }));
  
      return { count: result.count };
    }
  
    @Post('bulk-reject')
    async bulkReject(
      @Body('ids') ids: number[],
      @User() user: any,
      @Req() req: Request,
    ): Promise<{ count: number }> {
      console.log('Received IDs for Rejection:', ids);
      const result = await this.receivedOutService.bulkReject(ids);
  
      // Buat log audit
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
  
      // Buat dan kirim notifikasi untuk setiap ReceivedOut yang di-bulk
      await Promise.all(ids.map(async (id) => {
        await this.notificationsService.createNotification(
          user.sub,
          'Bulk Reject ReceivedOut',
          `ReceivedOut dengan ID ${id} telah di-bulk reject oleh ${user.name} pada ${new Date().toLocaleString()}.`,
        );
      }));
  
      return { count: result.count };
    }
  
    @Get('statistics')
    async getReceivedOutStatistics(): Promise<{
      waiting: number;
      approved: number;
      rejected: number;
    }> {
      return this.receivedOutService.getReceivedOutStatistics();
    }
  
    @Get('waiting')
    async getWaitingReceivedOuts(
      @Query() pageOptionReceivedOutDto: PageOptionReceivedOutDto,
    ): Promise<PageDto<ReceivedOutResponseDto>> {
      const data = await this.receivedOutService.getWaitingReceivedOuts(pageOptionReceivedOutDto);
      const mappedData = data.data.map(
        (item) => item as ReceivedOutResponseDto,
      );
      return new PageDto(mappedData, data.meta);
    }
  
    @Delete(':id')
    async remove(
      @Param() param: ParamIdDto,
      @User() user: any,
      @Req() req: Request,
    ): Promise<void> {
      const find = await this.receivedOutService.findOne(param.id);
      if (!find) throw new BadRequestException('Data tidak ditemukan.');
  
      await this.receivedOutService.remove(param.id);
  
      // Buat log audit
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
  
      // Buat dan kirim notifikasi dengan detail lebih lengkap
      await this.notificationsService.createNotification(
        user.sub,
        'ReceivedOut Dihapus',
        `ReceivedOut dengan ID ${param.id} telah dihapus oleh ${user.name} pada ${new Date().toLocaleString()}. Data detail yang dihapus: ${JSON.stringify(find)}.`,
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
  