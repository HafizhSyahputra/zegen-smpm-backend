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
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorService } from './vendor.service';
import { VendorEntity } from './entities/vendor.entity';
import { PageOptionVendorDto } from './dto/page-options-vendor.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { transformEntity } from '@smpm/common/transformer/entity.transformer';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { Request } from 'express';
import { AuditService } from '@smpm/audit/audit.service';

@UseGuards(AccessTokenGuard)
@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService, 
    private readonly auditService: AuditService
  ) {}

  @Post()
  async create(
    @Body() createVendorDto: CreateVendorDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<VendorEntity> {
    const create = new VendorEntity(await this.vendorService.create(createVendorDto));

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Create Vendor',
      MenuName: 'Vendor',
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

  @Get()
  async findAll(
    @Query() pageOptionVendorDto: PageOptionVendorDto,
  ): Promise<PageDto<VendorEntity>> {
    const data = await this.vendorService.findAll(pageOptionVendorDto);
    data.data = transformEntity(VendorEntity, data.data);

    return data;
  }

  @Get(':id')
  async findOne(@Param() param: ParamIdDto): Promise<VendorEntity> {
    const find = await this.vendorService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    return new VendorEntity(find);
  }

  @Patch(':id')
  async update(
    @Param() param: ParamIdDto,
    @Body() updateVendorDto: UpdateVendorDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<VendorEntity> {
    const find = await this.vendorService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const findExistCode = await this.vendorService.findOneBy({
      code: updateVendorDto.code,
    });
    if (findExistCode && findExistCode.id != find.id)
      throw new BadRequestException('Code already exist.');
    
    const oldData = await this.vendorService.findOne(Number(param.id));
    const update = new VendorEntity(
      await this.vendorService.update(param.id, updateVendorDto),
    );

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Update Vendor',
      MenuName: 'Vendor',
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
  async remove(@Param() param: ParamIdDto, @User() user: any, @Req() req: Request): Promise<null> {
    const find = await this.vendorService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const deletes = await this.vendorService.remove(param.id);

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Delete Vendor',
      MenuName: 'Vendor',
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

  @Get('get/all')
  async getAll(): Promise<VendorEntity> {
    return transformEntity(VendorEntity, await this.vendorService.getAll());
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
