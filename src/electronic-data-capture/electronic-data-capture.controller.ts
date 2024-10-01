import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { UpdateElectronicDataCaptureDto } from './dto/update-electronic-data-capture.dto';
import { ElectronicDataCaptureService } from './electronic-data-capture.service';
import { GetEdcBrandTypeDto } from './dto/get-edc-brand-type.dto';
import { BrandEntity } from './entities/brand.entity';
import { transformEntity } from '@smpm/common/transformer/entity.transformer';
import { BrandTypeEntity } from './entities/brand-type.entity';

@Controller('electronic-data-capture')
export class ElectronicDataCaptureController {
  constructor(
    private readonly electronicDataCaptureService: ElectronicDataCaptureService,
  ) {}

  @Post()
  create(@Body() createElectronicDataCaptureDto: any) {
    return this.electronicDataCaptureService.create(
      createElectronicDataCaptureDto,
    );
  }

  @Get()
  findAll(@Query() dto: PageOptionsDto) {
    return this.electronicDataCaptureService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.electronicDataCaptureService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateElectronicDataCaptureDto: UpdateElectronicDataCaptureDto,
  ) {
    return this.electronicDataCaptureService.update(
      +id,
      updateElectronicDataCaptureDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.electronicDataCaptureService.remove(+id);
  }

  @Get('brand/show')
  async getBrand(): Promise<BrandEntity> {
    return transformEntity(
      BrandEntity,
      await this.electronicDataCaptureService.getBrand(),
    );
  }

  @Get('brand-type/show')
  async getBrandType(
    @Query() getEdcBrandTypeDto: GetEdcBrandTypeDto,
  ): Promise<BrandTypeEntity> {
    return transformEntity(
      BrandTypeEntity,
      await this.electronicDataCaptureService.getBrandType(getEdcBrandTypeDto),
    );
  }
}
