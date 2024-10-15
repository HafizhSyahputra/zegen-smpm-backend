// src/approve-merchant/approve-merchant.controller.ts

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
  import { ApproveMerchantService } from './approve-merchant.service';
  import { PageDto } from '@smpm/common/decorator/page.dto';
  import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
  import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
  import { User } from '@smpm/common/decorator/currentuser.decorator';
  import { Request } from 'express';
  import { AuditService } from '@smpm/audit/audit.service';
  import { UpdateApproveMerchantDto, RejectApproveMerchantDto } from './dto/update-approve-merchant.dto';
import { CreateApproveMerchantDto } from './dto/create-approve-merchant.dto';
import { ApproveMerchantEntity } from './entities/approve-merchant.entity';
import { PageOptionApproveMerchantDto } from './dto/page-option-approve-merchant.dto';
import { ApprovalType } from './types/approve-merchant.types';
  
  @UseGuards(AccessTokenGuard)
  @Controller('approve-merchant')
  export class ApproveMerchantController {
    constructor(
      private readonly approveMerchantService: ApproveMerchantService,
      private readonly auditService: AuditService,
    ) {}
  
    @Post()
    async create(
      @Body() createApproveMerchantDto: CreateApproveMerchantDto,
      @User() user: any,
      @Req() req: Request,
    ): Promise<ApproveMerchantEntity> {
      try {
        const created = await this.approveMerchantService.create(createApproveMerchantDto, user, req);
  
        await this.auditService.create({
          Url: req.url,
          ActionName: 'Create ApproveMerchant',
          MenuName: 'ApproveMerchant',
          DataBefore: '',
          DataAfter: JSON.stringify(created),
          UserName: user.name,
          IpAddress: req.ip,
          ActivityDate: new Date(),
          Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
          OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
          AppSource: 'Desktop',
          created_by: user.sub,
          updated_by: user.sub,
        });
  
        return new ApproveMerchantEntity(created);
      } catch (error) {
        console.error('Error creating ApproveMerchant:', error);
        throw error;
      }
    }  
  
    @Get()
    async findAll(
      @Query() pageOptionApproveMerchantDto: PageOptionApproveMerchantDto,
    ): Promise<PageDto<ApproveMerchantEntity>> {
      const data = await this.approveMerchantService.findAll(pageOptionApproveMerchantDto);
      data.data = data.data.map(
        item =>
          new ApproveMerchantEntity({
            ...item,
          }),
      );
      return data;
    }
  
    @Get(':id')
    async findOne(@Param() param: ParamIdDto): Promise<ApproveMerchantEntity> {
      const find = await this.approveMerchantService.findOne(param.id);
      if (!find) throw new BadRequestException('Data not found.');
      return new ApproveMerchantEntity(find);
    }
  
    @Patch(':id')
    async update(
      @Param() param: ParamIdDto,
      @Body() updateApproveMerchantDto: UpdateApproveMerchantDto,
      @User() user: any,
      @Req() req: Request,
    ): Promise<ApproveMerchantEntity> {
      const existing = await this.approveMerchantService.findOne(param.id);
      if (!existing) throw new BadRequestException('Data not found.');
  
      const updated = await this.approveMerchantService.update(param.id, updateApproveMerchantDto);
  
      await this.auditService.create({
        Url: req.url,
        ActionName: 'Update ApproveMerchant',
        MenuName: 'ApproveMerchant',
        DataBefore: JSON.stringify(existing),
        DataAfter: JSON.stringify(updated),
        UserName: user.name,
        IpAddress: req.ip,
        ActivityDate: new Date(),
        Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
        OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
        AppSource: 'Desktop',
        created_by: user.sub,
        updated_by: user.sub,
      });
  
      return new ApproveMerchantEntity(updated);
    }
  
    @Patch(':id/approve')
    async approveItem(
      @Param() param: ParamIdDto,
      @User() user: any,
      @Req() req: Request,
    ): Promise<ApproveMerchantEntity> {
      const approveRecord = await this.approveMerchantService.findOne(param.id);
      if (!approveRecord) throw new BadRequestException('Data not found.');
  
      try {
        const approved = await this.approveMerchantService.approveItem(param.id, user.sub);
  
        await this.auditService.create({
          Url: req.url,
          ActionName: 'Approve ApproveMerchant',
          MenuName: 'ApproveMerchant',
          DataBefore: JSON.stringify(approveRecord),
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
  
        return new ApproveMerchantEntity(approved);
      } catch (error) {
        console.error('Error approving ApproveMerchant:', error);
        throw error;
      }
    }
  
    @Patch(':id/reject')
    async rejectItem(
      @Param() param: ParamIdDto,
      @Body() rejectApproveMerchantDto: RejectApproveMerchantDto,
      @User() user: any,
      @Req() req: Request,
    ): Promise<ApproveMerchantEntity> {
      const approveRecord = await this.approveMerchantService.findOne(param.id);
      if (!approveRecord) throw new BadRequestException('Data not found.');
  
      try {
        const rejected = await this.approveMerchantService.rejectItem(
          param.id,
          rejectApproveMerchantDto.reason,
          rejectApproveMerchantDto.info_remark,
          user.sub,
        );
  
        await this.auditService.create({
          Url: req.url,
          ActionName: 'Reject ApproveMerchant',
          MenuName: 'ApproveMerchant',
          DataBefore: JSON.stringify(approveRecord),
          DataAfter: JSON.stringify(rejected),
          UserName: user.name,
          IpAddress: req.ip,
          ActivityDate: new Date(),
          Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
          OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
          AppSource: 'Desktop',
          created_by: user.sub,
          updated_by: user.sub,
        });
  
        return new ApproveMerchantEntity(rejected);
      } catch (error) {
        console.error('Error rejecting ApproveMerchant:', error);
        throw error;
      }
    }
  
    @Post('bulk-approve')
    async bulkApprove(
      @Body('ids') ids: number[],
      @User() user: any,
      @Req() req: Request,
    ): Promise<{ count: number }> {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestException('IDs must be a non-empty array.');
      }
  
      try {
        const updateApprovedResult = await this.approveMerchantService.bulkApprove(ids, user.sub);
  
        await this.auditService.create({
          Url: req.url,
          ActionName: 'Bulk Approve ApproveMerchant',
          MenuName: 'ApproveMerchant',
          DataBefore: JSON.stringify(ids),
          DataAfter: JSON.stringify({
            count: updateApprovedResult.count,
            approved_by: user.sub,
            updated_by: user.sub,
          }),
          UserName: user.name,
          IpAddress: req.ip,
          ActivityDate: new Date(),
          Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
          OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
          AppSource: 'Desktop',
          created_by: user.sub,
          updated_by: user.sub,
        });
  
        return { count: updateApprovedResult.count };
      } catch (error) {
        console.error('Error bulk approving ApproveMerchant:', error);
        throw error;
      }
    }
  
    @Get('statistics')
    async getApprovalStatistics(): Promise<{
      waiting: number;
      approved: number;
      rejected: number;
    }> {
      return this.approveMerchantService.getApprovalStatistics();
    }
  
    @Get('waiting')
    async getWaitingApprovals(
      @Query() pageOptionApproveMerchantDto: PageOptionApproveMerchantDto,
    ): Promise<PageDto<ApproveMerchantEntity>> {
      const data = await this.approveMerchantService.getWaitingApprovals(pageOptionApproveMerchantDto);
      data.data = data.data.map(
        item =>
          new ApproveMerchantEntity({
            ...item,
          }),
      );
      return data;
    }
  
    @Get('type/:type')
    async getByType(
      @Param('type') type: string,
      @Query() pageOptionApproveMerchantDto: PageOptionApproveMerchantDto,
    ): Promise<PageDto<ApproveMerchantEntity>> {
      if (!['Add', 'Edit', 'Delete'].includes(type)) {
        throw new BadRequestException('Invalid type parameter. Must be "Add", "Edit", or "Delete".');
      }
  
      const data = await this.approveMerchantService.findByType(type, pageOptionApproveMerchantDto);
      data.data = data.data.map(
        item =>
          new ApproveMerchantEntity({
            ...item,
          }),
      );
      return data;
    }
  
    @Delete(':id')
    async remove(
      @Param() param: ParamIdDto,
      @User() user: any,
      @Req() req: Request,
    ): Promise<void> {
      const find = await this.approveMerchantService.findOne(param.id);
      if (!find) throw new BadRequestException('Data not found.');
  
      await this.approveMerchantService.remove(param.id);
  
      await this.auditService.create({
        Url: req.url,
        ActionName: 'Delete ApproveMerchant',
        MenuName: 'ApproveMerchant',
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
    }

    @Get('waiting/:type')
    async getWaitingApprovalsByType(
      @Param('type') type: ApprovalType,
      @Query() pageOptionApproveMerchantDto: PageOptionApproveMerchantDto,
    ): Promise<PageDto<ApproveMerchantEntity>> {
      if (!['Add', 'Edit', 'Delete'].includes(type)) {
        throw new BadRequestException('Invalid type parameter. Must be "Add", "Edit", or "Delete".');
      }
      const data = await this.approveMerchantService.getWaitingApprovalsByType(type, pageOptionApproveMerchantDto);
      data.data = data.data.map(item => new ApproveMerchantEntity({ ...item }));
      return data;
    }
  
    @Get('approved-rejected/:type')
    async getApprovedRejectedByType(
      @Param('type') type: ApprovalType,
      @Query() pageOptionApproveMerchantDto: PageOptionApproveMerchantDto,
    ): Promise<PageDto<ApproveMerchantEntity>> {
      if (!['Add', 'Edit', 'Delete'].includes(type)) {
        throw new BadRequestException('Invalid type parameter. Must be "Add", "Edit", or "Delete".');
      }
      const data = await this.approveMerchantService.getApprovedRejectedByType(type, pageOptionApproveMerchantDto);
      data.data = data.data.map(item => new ApproveMerchantEntity({ ...item }));
      return data;
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
  