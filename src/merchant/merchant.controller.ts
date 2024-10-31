// src/merchant/merchant.controller.ts

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
  Req,
  BadRequestException,
  InternalServerErrorException,
  ParseIntPipe,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { Request, Response } from 'express';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { GetMerchantQuery } from './dto/get-merchant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaxFileSize } from '@smpm/utils/FileValidator';
import { defaultConfig } from '@smpm/utils/FileConfig';
import { AuditService } from '@smpm/audit/audit.service';
import { DocumentMerchantService } from '@smpm/document-merchant/document-merchant.service';
import { ValidationException } from '@smpm/common/validator/validationExeption';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { ApproveMerchantService } from '@smpm/approve-merchant/approve-merchant.service';
import { CreateApproveMerchantDto } from '@smpm/approve-merchant/dto/create-approve-merchant.dto';
import { Merchant } from '@prisma/client';

@Controller('merchant')
export class MerchantController {
  constructor(
    private readonly merchantService: MerchantService,
    private readonly auditService: AuditService,
     private readonly approveMerchantService: ApproveMerchantService, // Inject ApproveMerchantService
  ) {}

  @Post()  
  async create(  
    @Body() createMerchantDto: CreateMerchantDto,  
    @User() user: any,  
    @Req() req: Request,  
  ) {  
    try {  
      // Persiapkan DataAfter sebagai JSON string dari CreateMerchantDto
      const dataAfter = JSON.stringify(createMerchantDto);

      // Buat record ApproveMerchant dengan type 'Add' dan status 'Waiting'
      const createApproveMerchantDto: CreateApproveMerchantDto = {
        type: 'Add',
        status: 'Waiting',
        DataBefore: '', // Karena ini adalah penambahan baru
        DataAfter: dataAfter,
        created_by: user?.sub,
      };

      const approvedMerchant = await this.approveMerchantService.create(createApproveMerchantDto, user, req);

      // Audit logging telah dilakukan di ApproveMerchantService

      // Return response
      return {  
        status: 'Pending Approval',  
        message: 'Request to add Merchant has been submitted for approval.',  
        approveMerchantId: approvedMerchant.id,  
      };  
    } catch (error) {  
      if (error instanceof ValidationException) {  
        return {  
          status: 'Error',  
          message: 'Validation error',  
          errors: error.validationErrors,  
        };  
      }  

      console.error('Error creating approve merchant:', error);  
      throw error;  
    }  
  }

  @UseInterceptors(FileInterceptor('file', { storage: defaultConfig }))
  @Post('/create-bulk-excel')
  async createBulkExcel(
    @Res() response: Response,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSize({
            maxSize: 10,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: Request, // Tambahkan parameter Request jika diperlukan
  ) {
    return await this.merchantService.createBulk(file.filename);
  }
  @Get()
  async findAll(@Query() pageOptionsDto: PageOptionsDto & GetMerchantQuery) {
    return await this.merchantService.findAll(pageOptionsDto);
  }

  @Get('all')  
  async getAllLogs(): Promise<{ status: { code: number; description: string }; result: Merchant[] }> {  
    try {  
      const data = await this.merchantService.getAll();  
      return {  
        status: {  
          code: 200,  
          description: "OK"  
        },  
        result: data  
      };  
    } catch (error) {  
      console.error('Error fetching audit logs:', error);  
      return {  
        status: {  
          code: 500,  
          description: "Internal Server Error"  
        },  
        result: []  
      };  
    }  
  }

  @Get('dropdown')
  async getMerchantsForDropdown(): Promise<{ status: { code: number; description: string }; result: { id: number; name: string }[] }> {
    try {
      const merchants = await this.merchantService.getMerchantsForDropdown();
      return {
        status: { code: 200, description: "OK" },
        result: merchants,
      };
    } catch (error) {
      console.error('Error fetching merchants for dropdown:', error);
      throw new InternalServerErrorException('Failed to fetch merchants for dropdown.');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Merchant> {
    return this.merchantService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
    @User() user: any,
    @Req() req: Request,
  ) {
    const merchantId = +id;
  
    // Ambil data Merchant yang ada
    const existingMerchant = await this.merchantService.findOne(merchantId);
    if (!existingMerchant) {
      throw new BadRequestException('Merchant not found.');
    }
  
    // Persiapkan DataBefore dan DataAfter
    const dataBefore = JSON.stringify(existingMerchant);
    const updatedData: Partial<CreateMerchantDto> = { ...existingMerchant, ...updateMerchantDto };
    const { id: _, ...dataWithoutId } = updatedData as { id?: number };
    const dataAfter = JSON.stringify(dataWithoutId);
  
    // Buat record ApproveMerchant dengan type 'Edit' dan status 'Waiting'
    const createApproveMerchantDto: CreateApproveMerchantDto = {
      merchant_id: merchantId,
      type: 'Edit',
      status: 'Waiting',
      DataBefore: dataBefore,
      DataAfter: dataAfter,
      updated_by: user?.sub,
    };
  
    const approvedMerchant = await this.approveMerchantService.create(createApproveMerchantDto, user, req);
  
    // Audit logging telah dilakukan di ApproveMerchantService
  
    return {  
      status: 'Pending Approval',  
      message: 'Request to edit Merchant has been submitted for approval.',  
      approveMerchantId: approvedMerchant.id,  
    };
  }

  

  @Delete(':id')
  async remove(@Param('id') id: string, @User() user: any, @Req() req: Request) {
    const merchantId = +id;

    // Ambil data Merchant yang ada
    const existingMerchant = await this.merchantService.findOne(merchantId);
    if (!existingMerchant) {
      throw new BadRequestException('Merchant not found.');
    }

    // Persiapkan DataBefore dan DataAfter
    const dataBefore = JSON.stringify(existingMerchant);
    const dataAfter = ''; // Karena ini adalah penghapusan

    // Buat record ApproveMerchant dengan type 'Delete' dan status 'Waiting'
    const createApproveMerchantDto: CreateApproveMerchantDto = {
      merchant_id: merchantId,
      type: 'Delete',
      status: 'Waiting',
      DataBefore: dataBefore,
      DataAfter: dataAfter,
      deleted_by: user?.sub,
    };

    const approvedMerchant = await this.approveMerchantService.create(createApproveMerchantDto, user, req);

    // Audit logging telah dilakukan di ApproveMerchantService

    return {  
      status: 'Pending Approval',  
      message: 'Request to delete Merchant has been submitted for approval.',  
      approveMerchantId: approvedMerchant.id,  
    };
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