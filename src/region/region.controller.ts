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
} from '@nestjs/common';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { transformEntity } from '@smpm/common/transformer/entity.transformer';
import { CreateRegionDto } from './dto/create-region.dto';
import { PageOptionRegionDto } from './dto/page-option-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { RegionEntity } from './entities/region.entity';
import { RegionService } from './region.service';

@Controller('region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Post()
  async create(
    @Body() createRegionDto: CreateRegionDto,
  ): Promise<RegionEntity> {
    return new RegionEntity(await this.regionService.create(createRegionDto));
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
  ): Promise<RegionEntity> {
    const find = await this.regionService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const findExistCode = await this.regionService.findOneBy({
      code: updateRegionDto.code,
    });
    if (findExistCode && findExistCode.id != find.id)
      throw new BadRequestException('Code already exist.');

    return new RegionEntity(
      await this.regionService.update(param.id, updateRegionDto),
    );
  }

  @Delete(':id')
  async remove(@Param() param: ParamIdDto): Promise<null> {
    const find = await this.regionService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    return await this.regionService.remove(param.id);
  }

  @Get('get/all')
  async getAll(): Promise<RegionEntity> {
    return transformEntity(RegionEntity, await this.regionService.getAll());
  }
}
