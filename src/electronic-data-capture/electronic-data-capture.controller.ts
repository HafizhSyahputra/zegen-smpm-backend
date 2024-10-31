// src/electronic-data-capture/electronic-data-capture.controller.ts

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateElectronicDataCaptureDto } from './dto/update-electronic-data-capture.dto';
import { ElectronicDataCaptureService } from './electronic-data-capture.service';
import { GetEdcBrandTypeDto } from './dto/get-edc-brand-type.dto';
import { BrandEntity } from './entities/brand.entity';
import { transformEntity } from '@smpm/common/transformer/entity.transformer';
import { BrandTypeEntity } from './entities/brand-type.entity';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateProviderSimcardDto } from './dto/create.provider';
import { ProviderEntity } from './entities/provider.entity';
import { GetElectronicDataCaptureDto } from './dto/get-electronic-data-capture';

@UseGuards(AccessTokenGuard)
@Controller('electronic-data-capture')

export class ElectronicDataCaptureController {
  constructor(
    private readonly electronicDataCaptureService: ElectronicDataCaptureService,private readonly prisma: PrismaService
    
  ) {}

  
  @Post('provider-simcard')
  async createProviderSimcard(
    @Body() createProviderSimcardDto: CreateProviderSimcardDto,
  ): Promise<ProviderEntity> {
    try {
      // Validate DTO
      await validateOrReject(plainToClass(CreateProviderSimcardDto, createProviderSimcardDto));

      const newProvider = await this.prisma.providerSimcard.create({
        data: {
          name_provider: createProviderSimcardDto.name_provider,
          // Assuming created_by is available from some auth mechanism
          // For example, you can inject the user information via a decorator as shown in your previous controller
        },
      });

      // Transform the response to exclude sensitive fields
      return plainToClass(ProviderEntity, newProvider, { excludeExtraneousValues: true });
    } catch (error) {
      if (error.name === 'BadRequestException') {
        throw new BadRequestException(error.message);
      }
      console.error('Error creating ProviderSimcard:', error);
      throw new InternalServerErrorException('Failed to create ProviderSimcard.');
    }
  }

  /**
   * Endpoint to retrieve all ProviderSimcards
   */
  @Get('provider-simcard')
  async getAllProviderSimcards(): Promise<ProviderEntity[]> {
    try {
      const providers = await this.prisma.providerSimcard.findMany({
        where: { deleted_at: null }, // Assuming soft delete
        orderBy: { id_provider_simcard: 'asc' },
      });

      // Transform the response to exclude sensitive fields
      return providers.map(provider =>
        plainToClass(ProviderEntity, provider, { excludeExtraneousValues: true }),
      );
    } catch (error) {
      console.error('Error fetching ProviderSimcards:', error);
      throw new InternalServerErrorException('Failed to fetch ProviderSimcards.');
    }
  }


  @Post()
  create(@Body() createElectronicDataCaptureDto: any, @User() user: any) {
    return this.electronicDataCaptureService.create(
      createElectronicDataCaptureDto,
      user,
    );
  }

  @Post('bulk-create')
  @UseInterceptors(FileInterceptor('file'))
  async bulkCreate(@UploadedFile() file: Express.Multer.File, @User() user: any) {
    console.log('Bulk Create - User:', user);
    if (!user || typeof user.id === 'undefined') {
      throw new InternalServerErrorException('User information is not available or incomplete.');
    }
    return this.electronicDataCaptureService.bulkCreate(file, user);
  }

  @Get('merchant/:merchantId')
  async getByMerchantId(@Param('merchantId') merchantId: string) {
    const parsedMerchantId = parseInt(merchantId, 10);
    if (isNaN(parsedMerchantId)) {
      throw new BadRequestException('Merchant Id harus berupa angka.');
    }

    const edcMachines = await this.electronicDataCaptureService.findByMerchantId(parsedMerchantId);
    return {
      status: 'Success',
      data: edcMachines,
    };
  }

  @Get('installed')
  async getInstalledMachines(@Query() filterDto: GetElectronicDataCaptureDto) {
    try {
      const filterWithStatus = new GetElectronicDataCaptureDto();
      Object.assign(filterWithStatus, filterDto);
      filterWithStatus.status_edc = filterWithStatus.status_edc || ['Terpasang'];

      const paginatedData = await this.electronicDataCaptureService.findAll(filterWithStatus);

      return {
        status: {
          code: 200,
          description: "OK"
        },
        result: {
          status: "Success",
          data: paginatedData.data,
          meta: paginatedData.meta,
        }
      };
    } catch (error) {
      console.error('Error in getInstalledMachines:', error);
      throw new InternalServerErrorException('Failed to fetch installed EDC machines.');
    }
  }

  @Get()
  findAll(@Query() filterDto: GetElectronicDataCaptureDto) {
    return this.electronicDataCaptureService.findAll(filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid ID format.');
    }
    return this.electronicDataCaptureService.findOne(numericId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateElectronicDataCaptureDto: UpdateElectronicDataCaptureDto,
    @User() user: any,
  ) {
    return this.electronicDataCaptureService.update(
      +id,
      updateElectronicDataCaptureDto,
      user,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.electronicDataCaptureService.remove(+id, user);
  }

  @Get('brand/show')
  async getBrand(): Promise<BrandEntity[]> {
    return transformEntity(
      BrandEntity,
      await this.electronicDataCaptureService.getBrand(),
    );
  }

  @Get('brand-type/show')
  async getBrandType(
    @Query() getEdcBrandTypeDto: GetEdcBrandTypeDto,
  ): Promise<BrandTypeEntity[]> {
    return transformEntity(
      BrandTypeEntity,
      await this.electronicDataCaptureService.getBrandType(getEdcBrandTypeDto),
    );
  }

  @Get('received-in')
  async getReceivedIn(
    @Query() getEdcBrandTypeDto: GetEdcBrandTypeDto,
  ) {
    if (!getEdcBrandTypeDto.brand && !getEdcBrandTypeDto.type) {
      throw new BadRequestException('At least one filter (brand atau type) harus diisi.');
    }

    const data = await this.electronicDataCaptureService.getReceivedIn(
      getEdcBrandTypeDto,
    );

    return {
      status: 'Success',
      data: data,
    };
  }

  @Get('received-out')
  async getReceivedOut(
    @Query() getEdcBrandTypeDto: GetEdcBrandTypeDto,
  ) {
    if (!getEdcBrandTypeDto.brand && !getEdcBrandTypeDto.type) {
      throw new BadRequestException('At least one filter (brand atau type) harus diisi.');
    }

    const data = await this.electronicDataCaptureService.getReceivedOut(
      getEdcBrandTypeDto,
    );

    return {
      status: 'Success',
      data: data,
    };
  }

}