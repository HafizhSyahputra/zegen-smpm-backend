// src/edc-terpasang/edc-terpasang.controller.ts

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
  import { CreateEDCTerpasangDto } from './dto/create-edc-terpasang.dto';
  import { UpdateEDCTerpasangDto } from './dto/update-edc-terpasang.dto';
  import { EDCTerpasangService } from './edc-terpasang.service';
  import { EDCTerpasangEntity } from './entities/edc-terpasang.entity';
  import { PageOptionEDCTerpasangDto } from './dto/page-option-edc-terpasang.dto';
  import { PageDto } from '@smpm/common/decorator/page.dto';
  import { transformEntity } from '@smpm/common/transformer/entity.transformer';
  import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
  import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
  
  @UseGuards(AccessTokenGuard)
  @Controller('edc-terpasang')
  export class EDCTerpasangController {
    constructor(private readonly edcTerpasangService: EDCTerpasangService) {}
  
    @Post()
    async create(
      @Body() createEDCTerpasangDto: CreateEDCTerpasangDto,
    ): Promise<EDCTerpasangEntity> {
      return new EDCTerpasangEntity(
        await this.edcTerpasangService.create(createEDCTerpasangDto),
      );
    }
  
    @Get()
    async findAll(
      @Query() pageOptionEDCTerpasangDto: PageOptionEDCTerpasangDto,
    ): Promise<PageDto<EDCTerpasangEntity>> {
      const data = await this.edcTerpasangService.findAll(pageOptionEDCTerpasangDto);
      data.data = transformEntity(EDCTerpasangEntity, data.data);
  
      return data;
    }
  
    @Get(':id')
    async findOne(@Param() param: ParamIdDto): Promise<EDCTerpasangEntity> {
      const find = await this.edcTerpasangService.findOne(param.id);
      if (!find) throw new BadRequestException('Data tidak ditemukan.');
  
      return new EDCTerpasangEntity(find);
    }
  
    @Patch(':id')
    async update(
      @Param() param: ParamIdDto,
      @Body() updateEDCTerpasangDto: UpdateEDCTerpasangDto,
    ): Promise<EDCTerpasangEntity> {
      const find = await this.edcTerpasangService.findOne(param.id);
      if (!find) throw new BadRequestException('Data tidak ditemukan.');
  
      if (updateEDCTerpasangDto.tid) {
        const findExistTid = await this.edcTerpasangService.findOneBy({
          tid: updateEDCTerpasangDto.tid.toUpperCase(),
        });
        if (findExistTid && findExistTid.id !== find.id)
          throw new BadRequestException('TID sudah ada.');
      }
  
      return new EDCTerpasangEntity(
        await this.edcTerpasangService.update(param.id, updateEDCTerpasangDto),
      );
    }
  
    @Delete(':id')
    async remove(@Param() param: ParamIdDto): Promise<null> {
      const find = await this.edcTerpasangService.findOne(param.id);
      if (!find) throw new BadRequestException('Data tidak ditemukan.');
  
      return await this.edcTerpasangService.remove(param.id);
    }
  
    @Get('get/all')
    async getAll(): Promise<EDCTerpasangEntity[]> {
      const data = await this.edcTerpasangService.getAll();
      return transformEntity(EDCTerpasangEntity, data);
    }
  }
  