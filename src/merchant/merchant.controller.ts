import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { Response } from 'express';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { GetMerchantQuery } from './dto/get-merchant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaxFileSize } from '@smpm/utils/FileValidator';
import { defaultConfig } from '@smpm/utils/FileConfig';

@Controller('merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post()
  async create(@Body() createMerchantDto: CreateMerchantDto) {
    return await this.merchantService.create(createMerchantDto);
  }

  @UseInterceptors(FileInterceptor('file', { storage: defaultConfig }))
  @Post('/create-bulk-excel')
  async createBulkExcel(
    @Res() response: Response,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // ... Set of file validator instances here
          new MaxFileSize({
            maxSize: 10,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.merchantService.createBulk(file.filename);
  }

  @Get()
  async findAll(@Query() pageOptionsDto: PageOptionsDto & GetMerchantQuery) {
    return await this.merchantService.findAll(pageOptionsDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.merchantService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
  ) {
    return this.merchantService.update(+id, updateMerchantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.merchantService.remove(+id);
  }
}
