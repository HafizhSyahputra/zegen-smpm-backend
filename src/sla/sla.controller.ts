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
  HttpCode,
  InternalServerErrorException,
  Header,
  Res,
} from '@nestjs/common';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { Request, Response } from 'express';
import { AuditService } from '@smpm/audit/audit.service';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { PageOptionSLADto } from './dto/page-option-sla.dto';
import { SLAEntity } from './entities/sla.entity';
import { UpdateSlaDto } from './dto/update-sla.dto';
import { SlaService } from './sla.service';

@UseGuards(AccessTokenGuard)
@Controller('sla')
export class SlaController {
  constructor(
    private readonly slaService: SlaService,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async findAll(
    @Query() pageOptionSLADto: PageOptionSLADto,
  ): Promise<PageDto<SLAEntity>> {
    const data = await this.slaService.findAll(pageOptionSLADto);
    data.data = data.data.map(
      (item) =>
        new SLAEntity({
          ...item,
        }),
    );
    return data;
  }

  @Post('update-duration')  
  async updateDurationManually() {  
    try {  
      const result = await this.slaService.updateDurationBatch();  
      return {  
        success: true,  
        message: 'SLA duration update completed successfully',  
        details: {  
          processed: result.totalProcessed,  
          updated: result.totalUpdated  
        }  
      };  
    } catch (error) {  
      throw new InternalServerErrorException(  
        'Failed to update SLA durations: ' + error.message  
      );  
    }  
  }  

  @Get(':id')
  async findOne(@Param() param: ParamIdDto): Promise<SLAEntity> {
    const find = await this.slaService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');
    return new SLAEntity(find);
  }

  @Patch(':id')
  async update(
    @Param() param: ParamIdDto,
    @Body() updateSLADto: UpdateSlaDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<SLAEntity> {
    const find = await this.slaService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const oldData = await this.slaService.findOne(Number(param.id));
    const update = new SLAEntity(
      await this.slaService.update(param.id, updateSLADto),
    );

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Edit SLA',
      MenuName: 'SLA',
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

  @Delete(':id')
  async remove(
    @Param() param: ParamIdDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<void> {
    const find = await this.slaService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    await this.slaService.remove(param.id);

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Delete SLA',
      MenuName: 'SLA',
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

  @Get('export/JobOrder')  
  @HttpCode(200)  
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')  
  @Header('Content-Disposition', 'attachment; filename=regular_sla_data.xlsx')  
  async exportRegularToExcel(@Res() res: Response) {  
    try {  
      const buffer = await this.slaService.exportJobOrderToExcel();  
      res.send(buffer);  
    } catch (error) {  
      throw new InternalServerErrorException('Failed to export regular SLA data: ' + error.message);  
    }  
  }  

  @Get('export/Preventive')  
  @HttpCode(200)  
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')  
  @Header('Content-Disposition', 'attachment; filename=preventive_sla_data.xlsx')  
  async exportPreventiveToExcel(@Res() res: Response) {  
    try {  
      const buffer = await this.slaService.exportPreventiveToExcel();  
      res.send(buffer);  
    } catch (error) {  
      throw new InternalServerErrorException('Failed to export preventive SLA data: ' + error.message);  
    }  
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
