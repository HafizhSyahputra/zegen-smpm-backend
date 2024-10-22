import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NominalService } from './nominal.service';
import { AuditService } from '@smpm/audit/audit.service';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { CreateNominalDto } from './dto/create-nominal.dto';
import { NominalEntity } from './entities/nominal.entity';
import { Request } from 'express';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { UpdateNominalDto } from './dto/update-nominal.dto';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { PageOptionNominalDto } from './dto/page-option.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';

@UseGuards(AccessTokenGuard)
@Controller('nominal')
export class NominalController {
  constructor(
    private readonly nominalService: NominalService,
    private readonly auditService: AuditService,
  ) {}
  
  @Get()
  async findAll(
    @Query() pageOptionNominalDto: PageOptionNominalDto,
  ): Promise<PageDto<NominalEntity>> {
    const data = await this.nominalService.findAll(pageOptionNominalDto);
    data.data = data.data.map(
      (item) =>
        new NominalEntity({
          ...item,
        }),
    );
    return data;
  }

  @Post()
  async create(
    @Body() createNominalDto: CreateNominalDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<NominalEntity> {
    const create = new NominalEntity(
      await this.nominalService.create(createNominalDto, user?.sub),
    );

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Create Nominal',
      MenuName: 'Nominal Job Order',
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

    return {
      ...create,
    };
  }

  @Patch(':id')
  async update(
    @Param() param: ParamIdDto,
    @Body() updateNominalDto: UpdateNominalDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<NominalEntity> {
    const find = await this.nominalService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const oldData = await this.nominalService.findOne(Number(param.id));
    const update = new NominalEntity(
      await this.nominalService.update(param.id, updateNominalDto, user?.sub),
    );

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Nominal Update',
      MenuName: 'Nominal Job Order',
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
  ): Promise<null> {
    const find = await this.nominalService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const deletes = await this.nominalService.remove(param.id);

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Delete Nominal',
      MenuName: 'Nominal Job Order',
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

    return deletes;
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
