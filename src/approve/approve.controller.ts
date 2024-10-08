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
import { ApproveService } from './approve.service';
import { ApproveEntity } from './entities/approve.entity';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { Request } from 'express';
import { AuditService } from '@smpm/audit/audit.service';
import { PageOptionApproveDto } from './dto/page-option.dto';
import { CreateApproveDto } from './dto/create-approve.dto';
import { UpdateApprovedDto } from './dto/update-approve.dto';

@UseGuards(AccessTokenGuard)
@Controller('approve')
export class ApproveController {
  constructor(
    private readonly approveService: ApproveService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  async create(
    @Body() createApproveDto: CreateApproveDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<ApproveEntity> {
    const create = await this.approveService.create(createApproveDto);

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Create Approve',
      MenuName: 'Approve',
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

    return create;
  }

  @Get()
  async findAll(
    @Query() pageOptionApproveDto: PageOptionApproveDto,
  ): Promise<PageDto<ApproveEntity>> {
    const data = await this.approveService.findAll(pageOptionApproveDto);
    data.data = data.data.map(
      (item) =>
        new ApproveEntity({
          ...item,
        }),
    );
    return data;
  }

  @Get(':id')
  async findOne(@Param() param: ParamIdDto): Promise<ApproveEntity> {
    const find = await this.approveService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');
    return new ApproveEntity(find);
  }

  @Patch(':id')
  async update(
    @Param() param: ParamIdDto,
    @Body() updateApproveDto: UpdateApprovedDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<ApproveEntity> {
    const find = await this.approveService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const oldData = await this.approveService.findOne(Number(param.id));
    const update = new ApproveEntity(
      await this.approveService.update(param.id, updateApproveDto),
    );

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Approve',
      MenuName: 'Approve',
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

    return update;
  }

  @Patch(':id/approve')
  async approveItem(
    @Param() param: ParamIdDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<ApproveEntity> {
    const find = await this.approveService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const approved = await this.approveService.approveItem(param.id);

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Approve Item',
      MenuName: 'Approve',
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

    return new ApproveEntity(approved);
  }
  
  @Patch(':id/reject')  
async rejectItem(  
  @Param() param: ParamIdDto,  
  @Body() rejectDto: { reason: string; info_remark: string },  
  @User() user: any,  
  @Req() req: Request,  
): Promise<ApproveEntity> {  
  const find = await this.approveService.findOne(param.id);  
  if (!find) throw new BadRequestException('Data not found.');  

  const rejected = await this.approveService.rejectItem(param.id, rejectDto.reason, rejectDto.info_remark);  

  await this.auditService.create({  
    Url: req.url,  
    ActionName: 'Reject Item',  
    MenuName: 'Approve',  
    DataBefore: JSON.stringify(find),  
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

  return new ApproveEntity(rejected);  
}

  @Post('bulk-approve')
  async bulkApprove(
    @Body('ids') ids: number[],
    @User() user: any,
    @Req() req: Request,
  ): Promise<{ count: number }> {
    console.log('Received IDs:', ids); 
    const result = await this.approveService.bulkApprove(ids); 

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Bulk Approve',
      MenuName: 'Approve',
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

    return { count: result.count };
  }

  @Get('statistics')
  async getApprovalStatistics(): Promise<{
    waiting: number;
    approved: number;
    rejected: number;
  }> {
    return this.approveService.getApprovalStatistics();
  }

  @Get('waiting')
  async getWaitingApprovals(
    @Query() pageOptionApproveDto: PageOptionApproveDto,
  ): Promise<PageDto<ApproveEntity>> {
    const data =
      await this.approveService.getWaitingApprovals(pageOptionApproveDto);
    data.data = data.data.map(
      (item) =>
        new ApproveEntity({
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
    const find = await this.approveService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    await this.approveService.remove(param.id);

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Delete Approve',
      MenuName: 'Approve',
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
