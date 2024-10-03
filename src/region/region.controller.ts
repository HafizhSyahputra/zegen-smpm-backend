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
} from '@nestjs/common';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { transformEntity } from '@smpm/common/transformer/entity.transformer';
import { CreateRegionDto } from './dto/create-region.dto';
import { PageOptionRegionDto } from './dto/page-option-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { RegionEntity } from './entities/region.entity';
import { RegionService } from './region.service';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { AuditService } from '@smpm/audit/audit.service';
import { Request } from 'express';

@Controller('region')
export class RegionController {
  constructor(
    private readonly regionService: RegionService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  async create(
    @Body() createRegionDto: CreateRegionDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<RegionEntity> {
    const create = new RegionEntity(
      await this.regionService.create(createRegionDto),
    );

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Create Region',
      MenuName: 'Region',
      DataBefore: '',
      DataAfter: JSON.stringify(create),
      UserName: '',
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: 6,
      updated_by: 6,
    });

    return {
      ...create,
    };
  }

  @Get()
  async findAll(
    @Query() pageOptionRegionDto: PageOptionRegionDto,
  ): Promise<PageDto<RegionEntity>> {
    const data = await this.regionService.findAll(pageOptionRegionDto);
    data.data = transformEntity(RegionEntity, data.data);

    return data;
  }

  @Get(':id')
  async findOne(@Param() param: ParamIdDto): Promise<RegionEntity> {
    const find = await this.regionService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    return new RegionEntity(find);
  }

  @Patch(':id')
  async update(
    @Param() param: ParamIdDto,
    @Body() updateRegionDto: UpdateRegionDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<RegionEntity> {
    const find = await this.regionService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const findExistCode = await this.regionService.findOneBy({
      code: updateRegionDto.code,
    });
    if (findExistCode && findExistCode.id != find.id)
      throw new BadRequestException('Code already exist.');

    const oldData = await this.regionService.findOne(Number(param.id));

    const update = new RegionEntity(
      await this.regionService.update(param.id, updateRegionDto),
    );

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Update Region',
      MenuName: 'Region',
      DataBefore: JSON.stringify(oldData),
      DataAfter: JSON.stringify(update),
      UserName: '',
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: 6,
      updated_by: 6,
    });

    return update;
  }

  @Delete(':id')
  async remove(
    @Param() param: ParamIdDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<null> {
    const find = await this.regionService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');
    const oldData = await this.regionService.findOne(Number(param.id));
    const deletes = await this.regionService.remove(param.id);


    await this.auditService.create({
      Url: req.url,
      ActionName: 'Delete Region',
      MenuName: 'Region',
      DataBefore: JSON.stringify(oldData),
      DataAfter: '',
      UserName: '',
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: 6,
      updated_by: 6,
    });

    return deletes;

  }

  @Get('get/all')
  async getAll(): Promise<RegionEntity> {
    return transformEntity(RegionEntity, await this.regionService.getAll());
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
