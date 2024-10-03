// src/lookup/lookup.controller.ts

import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
  } from '@nestjs/common';
  import { LookUpService } from './lookup.service';
  import { PageDto } from '../common/decorator/page.dto';
  import { LookUpEntity } from './entities/lookup.entity';
 import { CreateLookUpDto } from './dto/create-lookup.dto';
import { UpdateLookUpDto } from './dto/update-lookup.dto';
import { Message } from '@smpm/common/decorator/message.decorator';
import { GetLookUpOptionsDto } from './dto/get-lookup-options.dto';
  
  @Controller('look-up')
  export class LookUpController {
    constructor(private readonly lookUpService: LookUpService) {}
  
    @Post()
    @Message('LookUp berhasil dibuat')
    async create(@Body() createLookUpDto: CreateLookUpDto): Promise<LookUpEntity> {
      return await this.lookUpService.create(createLookUpDto);
    }
  
    @Get()
    @Message('LookUp berhasil diambil')
    async findAll(
      @Query() getLookUpOptionsDto: GetLookUpOptionsDto,
    ): Promise<PageDto<LookUpEntity>> {
      return await this.lookUpService.findAll(getLookUpOptionsDto);
    }
  
    @Get(':id')
    @Message('LookUp berhasil diambil')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<LookUpEntity> {
      return await this.lookUpService.findOne(id);
    }
  
    @Patch(':id')
    @Message('LookUp berhasil diperbarui')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateLookUpDto: UpdateLookUpDto,
    ): Promise<LookUpEntity> {
      return await this.lookUpService.update(id, updateLookUpDto);
    }
  
    @Delete(':id')
    @Message('LookUp berhasil dihapus')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<LookUpEntity> {
      return await this.lookUpService.remove(id);
    }
    
    @Get('/category/:category')
    async findByCategory(@Param('category') category: string): Promise<LookUpEntity[]> {
      return await this.lookUpService.findByCategory(category);
    }
  }
  