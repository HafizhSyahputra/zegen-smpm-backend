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

@UseGuards(AccessTokenGuard)
@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  async create(
    @Body() createVendorDto: CreateVendorDto,
  ): Promise<VendorEntity> {
    return new VendorEntity(await this.vendorService.create(createVendorDto));
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
  ): Promise<VendorEntity> {
    const find = await this.vendorService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const findExistCode = await this.vendorService.findOneBy({
      code: updateVendorDto.code,
    });
    if (findExistCode && findExistCode.id != find.id)
      throw new BadRequestException('Code already exist.');

    return new VendorEntity(
      await this.vendorService.update(param.id, updateVendorDto),
    );
  }

  @Delete(':id')
  async remove(@Param() param: ParamIdDto): Promise<null> {
    const find = await this.vendorService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    return await this.vendorService.remove(param.id);
  }

  @Get('get/all')
  async getAll(): Promise<VendorEntity> {
    return transformEntity(VendorEntity, await this.vendorService.getAll());
  }
}
