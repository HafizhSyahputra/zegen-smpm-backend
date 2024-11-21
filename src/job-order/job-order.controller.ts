import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Prisma, StagingJobOrder } from '@prisma/client';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { FileUploadInterceptor } from '@smpm/common/interceptors/file-upload.interceptor';
import { transformEntity } from '@smpm/common/transformer/entity.transformer';
import { AcknowledgeDto } from '@smpm/electronic-data-capture/dto/acknowledge.dto';
import { RegionService } from '@smpm/region/region.service';
import { UserService } from '@smpm/user/user.service';
import { VendorService } from '@smpm/vendor/vendor.service';
import * as dayjs from 'dayjs';
import * as ExcelJS from 'exceljs';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { PageOptionJobOrderDto } from './dto/page-option-job-order.dto';
import { JobOrderEntity } from './entities/job-order.entity';
import { JobOrderService } from './job-order.service';
import { CreateActivityJobOrderDto } from './dto/create-activity-job-order.dto';
import { FileFieldsUploadInterceptor } from '@smpm/common/interceptors/file-fields-upload.interceptor';
import { MediaService } from '@smpm/media/media.service';
import { ApproveService } from '@smpm/approve/approve.service';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { AuditService } from '@smpm/audit/audit.service';
import { MerchantService } from '@smpm/merchant/merchant.service';
import { ElectronicDataCaptureService } from '@smpm/electronic-data-capture/electronic-data-capture.service';
import { ElectronicDataCaptureService as EDCService } from '@smpm/electronic-data-capture/electronic-data-capture.service';
import { ReceivedInService } from '@smpm/received-in/received-in.service';
import { ReceivedOutService } from '@smpm/received-out/received-out.service';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { NominalService } from '@smpm/nominal/nominal.service';
import { CreatePreventiveMaintenanceReportDto } from '@smpm/preventive-maintenance-report/dto/create-pm-report.dto';
import { ValidationError, ValidationResult } from '@smpm/common/interfaces/config.interface';
import * as mime from 'mime-types';

@UseGuards(AccessTokenGuard)
@Controller('job-order')
export class JobOrderController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobOrderService: JobOrderService,
    private readonly regionService: RegionService,
    private readonly vendorService: VendorService,
    private readonly merchantService: MerchantService,
    private readonly edcService: ElectronicDataCaptureService,
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
    private readonly approveService: ApproveService,
    private readonly auditService: AuditService,
    // private readonly docVendorService: DocumentVendorService,
    private readonly receivedInService: ReceivedInService, 
    private readonly receivedOutService: ReceivedOutService, 
    private readonly eDCService: EDCService, 
    private readonly nominalService: NominalService,
  ) {}

  @Get('open')
  async findAllOpen(
    @Query() pageOptionJobOrderDto: PageOptionJobOrderDto,
  ): Promise<PageDto<JobOrderEntity>> {
    const data = await this.jobOrderService.findAllOpen(pageOptionJobOrderDto);
    data.data = transformEntity(JobOrderEntity, data.data);

    return data;
  }

  @Get('all-jo')  
  findMany() {  
    return this.jobOrderService.getAllJO();  
  }  

  @Get('activity')
  async findAllActivity(
    @Query() pageOptionJobOrderDto: PageOptionJobOrderDto,
  ): Promise<PageDto<JobOrderEntity>> {
    const data = await this.jobOrderService.findAllActivity(
      pageOptionJobOrderDto,
    );
    data.data = transformEntity(JobOrderEntity, data.data);

    return data;
  }

  @Get('staging/:no_jo')  
  async getJobOrderByNoJo(@Param('no_jo') no_jo: string): Promise<StagingJobOrder[]> {  
    const jobOrders = await this.jobOrderService.findStagingNoJo(no_jo);  

     if (jobOrders.length === 0) {  
      throw new NotFoundException(`No job orders found with no_jo: ${no_jo}`);  
    }  

    return jobOrders;  
  }  

  @Get('media/download/:filename')  
  async downloadMedia(@Param('filename') filename: string, @Res() res: Response) {  
    try {  
      // Sanitasi filename untuk keamanan  
      const sanitizedFilename = filename.replace(/\.\./g, '').replace(/[/\\]/g, '');  
      const filePath = path.join(process.cwd(), 'uploads/job-order', sanitizedFilename);  
      
      // Periksa apakah file exists  
      if (!fs.existsSync(filePath)) {  
        throw new NotFoundException(`File ${sanitizedFilename} not found`);  
      }  
      
      // Set header yang sesuai  
      const mimeType = mime.lookup(filePath) || 'application/octet-stream';  
      res.set({  
        'Content-Type': mimeType,  
        'Content-Disposition': `attachment; filename="${sanitizedFilename}"`,  
        'Cache-Control': 'no-cache'  
      });  
      
      // Stream file ke response  
      const fileStream = fs.createReadStream(filePath);  
      fileStream.pipe(res);  
      
    } catch (error) {  
      console.error('Download error:', error);  
      if (error instanceof NotFoundException) {  
        throw error;  
      }  
      throw new InternalServerErrorException('Error downloading file');  
    }  
  }

  @Get('template/download')
  async downloadTemplateBulkInsert(@Res() res: Response) {
    if (
      fs.existsSync(path.join('./templates', '/bulk/job-order-template.xlsx'))
    ) {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=job-order-template.xlsx',
      );

      return res.sendFile('/bulk/job-order-template.xlsx', {
        root: './templates',
      });
    } else {
      throw new NotFoundException('File not found');
    }
  }

  @UseInterceptors(  
    FileUploadInterceptor({  
      name: 'files',  
      dirPath: './uploads/bulk/job-order',  
      prefixName: 'job-order',  
      ext: ['xlsx'],  
    })  
  )  
  @Post('bulk/upload')  
  async uploadBulk(  
    @Req() req: Request,  
    @User() user: any,  
    @UploadedFiles() files: Express.Multer.File[],  
    @Body() body: { preventive_type: string }  
  ) {  
    if (!files || files.length === 0) {  
      throw new BadRequestException('File tidak boleh kosong');  
    }  
  
    if (files && files.length > 1) {  
      throw new BadRequestException('Hanya 1 file yang dizinkan');  
    }  
  
    const workbook = new ExcelJS.Workbook();  
    await workbook.xlsx.readFile(files[0].path, {  
      ignoreNodes: ['dataValidations'],  
    });  
  
    const worksheet = workbook.getWorksheet(1);  
  
    const [allRegion, allVendor, allMid, allTid, allNominal] = await Promise.all([  
      this.regionService.getAll(),  
      this.vendorService.getAll(),  
      this.merchantService.getAll(),  
      this.edcService.getAll(),  
      this.nominalService.getAll(),  
    ]);  
  
    const data: Prisma.JobOrderUncheckedCreateInput[] = [];  
    const errors: {  
      row: number;  
      column: string;  
      value: string;  
      message: string;  
    }[] = [];  
  
    const jobOrderTypeCode = {  
      'New Installation': 'IS',  
      'CM Replace': 'CM',  
      'CM Re-init': 'CM',  
      'Preventive Maintenance': 'PM',  
      Withdrawal: 'WD',  
      'Cancel Installation': 'CI',  
      'Cancel Withdrawal': 'CW',  
    };  
  
    const ownerStatusCode = {  
      Sewa: 'SW',  
      Milik: 'MS',  
    };  
  
    const slaIds: number[] = [];  
    const slaHours: number[] = [];  
    const jobOrderActionMapping: { [key: string]: string } = {  
      Withdrawal: 'Penarikan',  
      'New Installation': 'Pemasangan',  
      'CM Replace': 'Penggantian Unit',  
      'Preventive Maintenance': 'Preventive Maintenance',  
      'CM Re-init': 'Corrective Maintenance',  
    };  
  
    const merchantCategoryScopeMapping: { [key: string]: string } = {  
      Retail: 'RETAIL',  
      'Local Chainstore': 'CHAINSTORE',  
      'National Chainstore': 'MALL',  
      Strategic: 'CLUSTER PRIORITAS',  
      Agen46: 'AGEN',  
    };  
  
    worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {  
      if (rowNumber >= 4) {  
        const requiredColumns = [  
          { cell: 'C', name: 'KODE WILAYAH' },  
          { cell: 'D', name: 'KODE VENDOR' },  
          { cell: 'E', name: 'JENIS JO' },  
          { cell: 'G', name: 'MID' },  
          { cell: 'H', name: 'TID' },  
          { cell: 'I', name: 'NAMA MERCHANT' },  
          { cell: 'J', name: 'Address 1' },  
          { cell: 'K', name: 'Address 2' },  
          { cell: 'L', name: 'Address 3' },  
          { cell: 'M', name: 'Address 4' },  
          { cell: 'R', name: 'PIC' },  
          { cell: 'S', name: 'No.Telepon 1' },  
          { cell: 'BN', name: 'KATEGORI SEWA/MILIK' },  
        ];  
  
        requiredColumns.forEach((item) => {  
          if (!row.getCell(item.cell).value)  
            errors.push({  
              row: rowNumber,  
              column: item.name,  
              value: row.getCell(item.cell).value  
                ? row.getCell(item.cell).value.toString()  
                : null,  
              message: `${item.name} tidak boleh kosong`,  
            });  
        });  
  
        const selectedRegion = allRegion.find(  
          (x) => x.code == row.getCell('C').value?.toString()  
        );  
        if (row.getCell('C').value && !selectedRegion)  
          errors.push({  
            row: rowNumber,  
            column: 'KODE WILAYAH',  
            value: row.getCell('C').value  
              ? row.getCell('C').value.toString()  
              : null,  
            message: `KODE WILAYAH tidak ditemukan`,  
          });  
  
        const selectedVendor = allVendor.find(  
          (x) => x.code == row.getCell('D').value?.toString()  
        );  
        if (row.getCell('D').value && !selectedVendor)  
          errors.push({  
            row: rowNumber,  
            column: 'KODE VENDOR',  
            value: row.getCell('D').value  
              ? row.getCell('D').value.toString()  
              : null,  
            message: `KODE VENDOR tidak ditemukan`,  
          });  
  
        const selectedMid = allMid.find(  
          (x) => x.mid == row.getCell('G').value?.toString()  
        );  
        if (row.getCell('G').value && !selectedMid)  
          errors.push({  
            row: rowNumber,  
            column: 'MID',  
            value: row.getCell('G').value  
              ? row.getCell('G').value.toString()  
              : null,  
            message: `data mid tidak ditemukan`,  
          });  
  
        const selectedTid = allTid.find(  
          (x) => x.tid == row.getCell('H').value?.toString()  
        );  
        if (row.getCell('H').value && !selectedTid)  
          errors.push({  
            row: rowNumber,  
            column: 'TID',  
            value: row.getCell('H').value  
              ? row.getCell('H').value.toString()  
              : null,  
            message: `data tid tidak ditemukan`,  
          });  
  
        const selectedNominal = allNominal.find(  
          (x) => x.jenis === row.getCell('E').value?.toString() &&  
                 x.vendor_id === selectedVendor?.id  
        );  
  
        if (!selectedNominal) {  
          errors.push({  
            row: rowNumber,  
            column: 'NOMINAL',  
            value: null,  
            message: `Nominal tidak ditemukan untuk jenis ${row.getCell('E').value} dan vendor ${selectedVendor?.code}`,  
          });  
        }  
  
        const merchantCategory = row.getCell('BM').value  
          ? row.getCell('BM').value.toString()  
          : null;  
        const jobOrderType = row.getCell('E').value  
          ? row.getCell('E').value.toString()  
          : null;  
      
        if (errors.length === 0) {  
          data.push({  
            nominal_awal: selectedNominal?.nominal,  
            vendor_id: selectedVendor.id,  
            region_id: selectedRegion.id,  
            mid: selectedMid.mid,  
            tid: selectedTid.tid,  
            no: `${req.user['role']['code']}${selectedRegion.code}-${  
              selectedVendor.code  
            }-${dayjs().format('DDMMYYYY')}-${  
              jobOrderTypeCode[row.getCell('E').value.toString()]  
            }-${ownerStatusCode[row.getCell('BN').value.toString()]}-`,  
            type: row.getCell('E').value  
              ? row.getCell('E').value.toString()  
              : null,  
            date: new Date(),  
            status: 'Open',  
            merchant_name: row.getCell('I').value  
              ? row.getCell('I').value.toString()  
              : null,  
            address1: row.getCell('J').value  
              ? row.getCell('J').value.toString()  
              : null,  
            address2: row.getCell('K').value  
              ? row.getCell('K').value.toString()  
              : null,  
            address3: row.getCell('L').value  
              ? row.getCell('L').value.toString()  
              : null,  
            address4: row.getCell('M').value  
              ? row.getCell('M').value.toString()  
              : null,  
            subdistrict: row.getCell('N').value  
              ? row.getCell('N').value.toString()  
              : null,  
            village: row.getCell('O').value  
              ? row.getCell('O').value.toString()  
              : null,  
            city: row.getCell('P').value  
              ? row.getCell('P').value.toString()  
              : null,  
            postal_code: row.getCell('Q').value  
              ? row.getCell('Q').value.toString()  
              : null,  
            pic: row.getCell('R').value  
              ? row.getCell('R').value.toString()  
              : null,  
            phone_number1: row.getCell('S').value  
              ? row.getCell('S').value.toString()  
              : null,  
            phone_number2: row.getCell('T').value  
              ? row.getCell('T').value.toString()  
              : null,  
            provider: row.getCell('U').value  
              ? row.getCell('U').value.toString()  
              : null,  
            trx_type_mini_atm: row.getCell('V').value  
              ? row.getCell('V').value.toString()  
              : null,  
            trx_type_visa: row.getCell('W').value  
              ? row.getCell('W').value.toString()  
              : null,  
            trx_type_master: row.getCell('X').value  
              ? row.getCell('X').value.toString()  
              : null,  
            trx_type_jcb: row.getCell('Y').value  
              ? row.getCell('Y').value.toString()  
              : null,  
            trx_type_maestro: row.getCell('Z').value  
              ? row.getCell('Z').value.toString()  
              : null,  
            trx_type_gpn: row.getCell('AA').value  
              ? row.getCell('AA').value.toString()  
              : null,  
            trx_type_tapcash_topup: row.getCell('AB').value  
              ? row.getCell('AB').value.toString()  
              : null,  
            trx_type_tapcash_purchase: row.getCell('AC').value  
              ? row.getCell('AC').value.toString()  
              : null,  
            trx_type_qrcode_qris: row.getCell('AD').value  
              ? row.getCell('AD').value.toString()  
              : null,  
            trx_type_qrcode_linkaja: row.getCell('AE').value  
              ? row.getCell('AE').value.toString()  
              : null,  
            trx_type_contactless_master: row.getCell('AF').value  
              ? row.getCell('AF').value.toString()  
              : null,  
            trx_type_contractless_visa: row.getCell('AG').value  
              ? row.getCell('AG').value.toString()  
              : null,  
            edc_facility_cepp_plan1: row.getCell('AH').value  
              ? row.getCell('AH').value.toString()  
              : null,  
            edc_facility_cepp_plan2: row.getCell('AI').value  
              ? row.getCell('AI').value.toString()  
              : null,  
            edc_facility_cepp_plan3: row.getCell('AJ').value  
              ? row.getCell('AJ').value.toString()  
              : null,  
            edc_facility_reedem_point: row.getCell('AK').value  
              ? row.getCell('AK').value.toString()  
              : null,  
            edc_facility_activation_keyinsales: row.getCell('AL').value  
              ? row.getCell('AL').value.toString()  
              : null,  
            edc_facility_activation_keyinsales_keyinpreauth_completion:  
              row.getCell('AM').value  
                ? row.getCell('AM').value.toString()  
                : null,  
            edc_facility_activation_keyinpreauth_completion: row.getCell('AN')  
              .value  
              ? row.getCell('AN').value.toString()  
              : null,  
            edc_facility_activation_preauth_completion: row.getCell('AO').value  
              ? row.getCell('AO').value.toString()  
              : null,  
            edc_facility_activation_keyinsales_preauth_completion: row.getCell(  
              'AP',  
            ).value  
              ? row.getCell('AP').value.toString()  
              : null,  
            edc_facility_offline: row.getCell('AQ').value  
              ? row.getCell('AQ').value.toString()  
              : null,  
            edc_facility_card_ver: row.getCell('AR').value  
              ? row.getCell('AR').value.toString()  
              : null,  
            edc_facility_refund: row.getCell('AS').value  
              ? row.getCell('AS').value.toString()  
              : null,  
            edc_facility_adjust_tip: row.getCell('AT').value  
              ? row.getCell('AT').value.toString()  
              : null,  
            trx_test_credit: row.getCell('AU').value  
              ? row.getCell('AU').value.toString()  
              : null,  
            trx_test_debit: row.getCell('AV').value  
              ? row.getCell('AV').value.toString()  
              : null,  
            trx_test_inquiry: row.getCell('AW').value  
              ? row.getCell('AW').value.toString()  
              : null,  
            trx_test_transfer: row.getCell('AX').value  
              ? row.getCell('AX').value.toString()  
              : null,  
            trx_test_jcb: row.getCell('AY').value  
              ? row.getCell('AY').value.toString()  
              : null,  
            trx_test_gpn: row.getCell('AZ').value  
              ? row.getCell('AZ').value.toString()  
              : null,  
            trx_test_tapcash: row.getCell('BA').value  
              ? row.getCell('BA').value.toString()  
              : null,  
            trx_test_qris: row.getCell('BB').value  
              ? row.getCell('BB').value.toString()  
              : null,  
            trx_test_linkaja: row.getCell('BC').value  
              ? row.getCell('BC').value.toString()  
              : null,  
            trx_test_visa_contactless: row.getCell('BD').value  
              ? row.getCell('BD').value.toString()  
              : null,  
            trx_test_master_contactless: row.getCell('BE').value  
              ? row.getCell('BE').value.toString()  
              : null,  
            trx_test_instalment: row.getCell('BF').value  
              ? row.getCell('BF').value.toString()  
              : null,  
            trx_test_reedemption: row.getCell('BG').value  
              ? row.getCell('BG').value.toString()  
              : null,  
            thermal_paper: row.getCell('BH').value  
              ? Number(row.getCell('BH').value.toString())  
              : null,  
            sticker_bni: row.getCell('BI').value  
              ? row.getCell('BI').value.toString()  
              : null,  
            acrylic: row.getCell('BJ').value  
              ? row.getCell('BJ').value.toString()  
              : null,  
            description1: row.getCell('BK').value  
              ? row.getCell('BK').value.toString()  
              : null,  
            description2: row.getCell('BL').value  
              ? row.getCell('BL').value.toString()  
              : null,  
            merchant_category: row.getCell('BM').value  
              ? row.getCell('BM').value.toString()  
              : null,  
            ownership: row.getCell('BN').value  
              ? row.getCell('BN').value.toString()  
              : null,
            preventive_type: body.preventive_type,  
          });  
        }  
      }  
    });  
  
    if (errors.length > 0)  
      throw new BadRequestException({  
        message: 'Terdapat data yang tidak valid pada file yang diupload',  
        errors,  
      });  
  
    await this.auditService.create({  
      Url: req.url,  
      ActionName: 'Bulk Create Job Order',  
      MenuName: 'Job Order',  
      DataBefore: '',  
      DataAfter: JSON.stringify(data),  
      UserName: user.name,  
      IpAddress: req.ip,   
      ActivityDate: new Date(),  
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),  
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),  
      AppSource: 'Desktop',  
      created_by: user.sub,  
      updated_by: user.sub,  
    });  
  
    const createdBy = user.sub; 

    const createdJobOrders = await this.jobOrderService.createMany(data, null , createdBy);
    
    // const createdJobOrders = await this.jobOrderService.createMany(data);  
    
    const now = new Date();  
    const jobOrdersWithNominals = await this.jobOrderService.getAll({  
      created_at: {  
        gte: new Date(now.getTime() - 1500),  
      },  
    });  
  
    const updatePromises = jobOrdersWithNominals.map(async (jobOrder, index) => {  
      const matchingNominal = allNominal.find(  
        (x) => x.jenis === jobOrder.type &&  
              x.vendor_id === jobOrder.vendor_id  
            );  
  
      if (matchingNominal) {  
        await this.jobOrderService.updateNominal(jobOrder.id, matchingNominal.nominal);  
      }  
    });  
    
    await Promise.all(updatePromises);  

    const preventiveTypesByMerchant: { [key: string]: string } = {};  
    
    const updatePreventiveType = jobOrdersWithNominals.filter((jobOrder) => jobOrder.type === 'Preventive Maintenance')  
      .map(async (jobOrder) => {  
        const preventiveType = body[`preventive_type_${jobOrder.merchant_name}`];  
        if (preventiveType) {  
          await this.jobOrderService.updatePreventiveType(jobOrder.id, preventiveType);  
        }  
      });  

    await Promise.all(updatePreventiveType); 
    console.log('Preventive Types by Merchant:', preventiveTypesByMerchant);
    console.log('Created Job Orders:', createdJobOrders);  
    console.log('Job Orders with Nominals:', jobOrdersWithNominals);  
    console.log('Nominals:', allNominal);  

    const stagingRecords = jobOrdersWithNominals.map((jobOrder) => ({  
      job_order_no: jobOrder.no,  
      staging_id: 1,  
      created_by: user.sub,  
      updated_by: user.sub,  
    }));  
  
    const SLA: Prisma.SLACreateManyInput[] = await Promise.all(  
      jobOrdersWithNominals.map(async (jobOrder, index) => {  
        let correspondingScope;  
        if (jobOrder.type === 'Preventive Maintenance') {  
          correspondingScope = preventiveTypesByMerchant[jobOrder.merchant_name];  
        } else {  
          const merchantCategory = jobOrder.merchant_category;  
          correspondingScope = merchantCategoryScopeMapping[merchantCategory] || 'Unknown Scope';  
        }  
    
        // Mencari SLA  
        const relevantSlaRegions = await this.jobOrderService.findSlaByGroupRegionAndScope(  
          jobOrder.region.region_group,  
          correspondingScope,  
          jobOrderActionMapping[jobOrder.type] || 'Unknown Action'  
        );  
        console.log("relevantSLA : ", relevantSlaRegions);  
    
        const slaIds = new Set<number>();  
        relevantSlaRegions.forEach((sla) => {  
          slaIds.add(sla.id_sla);  
          slaHours.push(sla.hour);  
        });  
    
        const openTime = new Date(now.getTime() - 1000);  
        const targetTime = new Date(  
          openTime.getTime() + (Math.max(...slaHours) * 60 * 60 * 1000)  
        );  
    
        return {  
          job_order_no: jobOrder.no,  
          vendor_id: jobOrder.vendor_id,  
          region_id: jobOrder.region_id,  
          tid: jobOrder.tid,  
          mid: jobOrder.mid,  
          region_group_id: jobOrder.region.region_group,  
          sla_region: Math.max(...slaIds), 
          open_time: openTime,  
          target_time: targetTime || null,  
          status_sla: 'In Progress',  
          status: 'Open',  
          created_by: user.sub,  
          updated_by: user.sub,  
        };  
      })  
    );
    
    try {  
      await Promise.all([  
        this.prisma.stagingJobOrder.createMany({  
          data: stagingRecords,  
        }),  
        this.prisma.sLA.createMany({  
          data: SLA,  
        }),  
      ]);  
      console.log('Created Staging Job Orders:', stagingRecords);  
      console.log('Created SLA:', SLA);  
    } catch (error) {  
      console.error('Error creating SLA:', error);  
      throw new BadRequestException('Failed to create staging job orders');  
    }
  
    return {  
      data_uploaded_count: data.length,  
    };  
  }

  @UseInterceptors(  
    FileUploadInterceptor({  
      name: 'files',  
      dirPath: './uploads/bulk/job-order-acknowledge',  
      prefixName: 'job-order-acknowledge',  
      ext: ['xlsx'],  
    }),  
  )  
  @Post('bulk/acknowledge')  
  async acknowledge(  
    @Req() req: Request,  
    @User() user: any,  
    @UploadedFiles() files: Express.Multer.File[],  
  ) {  
    try {  
      if (!files?.length) {  
        throw new BadRequestException('File tidak boleh kosong');  
      }  
      if (files.length > 1) {  
        throw new BadRequestException('Hanya 1 file yang dizinkan');  
      }  
  
      const data = await this.parseExcelFile(files[0]);  
      
      const results = await this.processBatchAcknowledge(data, user, req);  
  
      return {  
        message: 'Bulk acknowledge processed successfully',  
        processed: results.totalProcessed,  
        details: results.details,  
      };  
  
    } catch (error) {  
      console.error('Bulk acknowledge error:', error);  
      throw error;  
    } finally {  
      await this.cleanupFiles(files);  
    }  
  }  
  
  private async parseExcelFile(file: Express.Multer.File): Promise<AcknowledgeDto[]> {  
    const workbook = new ExcelJS.Workbook();  
    await workbook.xlsx.readFile(file.path, {  
      ignoreNodes: ['dataValidations'],  
    });  
  
    const worksheet = workbook.getWorksheet(1);  
    const data: AcknowledgeDto[] = [];  
    const errors: ValidationError[] = [];  
  
    // Validasi dan ekstrak data dari Excel  
    const rows = worksheet.getRows(4, worksheet.rowCount - 3);  
    const existJobOrders = await this.validateJobOrders(rows);  
  
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {  
      if (rowNumber >= 4) {  
        const rowValidation = this.validateRow(row, rowNumber, existJobOrders[rowNumber - 4]);  
        if (rowValidation.isValid) {  
          data.push(rowValidation.data);  
        } else {  
          errors.push(...rowValidation.errors);  
        }  
      }  
    });  
  
    if (errors.length > 0) {  
      throw new BadRequestException({  
        message: 'Terdapat data yang tidak valid pada file yang diupload',  
        errors,  
      });  
    }  
  
    return data;  
  }  
  
  private async processBatchAcknowledge(  
    data: AcknowledgeDto[],  
    user: any,  
    req: Request,  
  ): Promise<{ totalProcessed: number; details: any[] }> {  
    const BATCH_SIZE = 50;  
    const batches = this.createBatches(data, BATCH_SIZE);  
    const results = [];  
  
    for (const [index, batch] of batches.entries()) {  
      try {  
        const result = await this.processsingBatch(batch, user, req, index + 1);  
        results.push(result);  
      } catch (error) {  
        console.error(`Error processing batch ${index + 1}:`, error);  
        throw new InternalServerErrorException(  
          `Failed processing batch ${index + 1}: ${error.message}`,  
        );  
      }  
    }  
  
    return {  
      totalProcessed: results.reduce((acc, curr) => acc + curr.processed, 0),  
      details: results,  
    };  
  }  
  
  private async processsingBatch(  
    batch: AcknowledgeDto[],  
    user: any,  
    req: Request,  
    batchNumber: number,  
  ): Promise<any> {  
    const startTime = Date.now();  
  
    return await this.prisma.$transaction(  
      async (prisma) => {  
        // 1. Create audit log  
        await this.createAuditLog(prisma, batch, user, req);  
  
        // 2. Create staging records  
        const stagingRecords = this.prepareStagingRecords(batch, user);  
        await prisma.stagingJobOrder.createMany({  
          data: stagingRecords,  
        });  
  
        // 3. Update SLA records  
        const slaResults = await this.updateSLARecords(prisma, batch, user);  
  
        // 4. Process job order acknowledge  
        await this.jobOrderService.acknowlege(batch);  
  
        const processingTime = Date.now() - startTime;  
        return {  
          batchNumber,  
          processed: batch.length,  
          slaUpdated: slaResults.count,  
          processingTime,  
        };  
      },  
      {  
        timeout: 60000, // 60 seconds timeout  
        maxWait: 5000, // 5 seconds max wait  
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,  
      },  
    );  
  }  
  
  private createBatches<T>(data: T[], batchSize: number): T[][] {  
    const batches: T[][] = [];  
    for (let i = 0; i < data.length; i += batchSize) {  
      batches.push(data.slice(i, i + batchSize));  
    }  
    return batches;  
  }  
  
  private async createAuditLog(  
    prisma: Prisma.TransactionClient,  
    data: any[],  
    user: any,  
    req: Request,  
  ): Promise<void> {  
    await prisma.auditTrail.create({  
      data: {  
        Url: req.url,  
        ActionName: 'Bulk Create Job Order Acknowledge',  
        MenuName: 'Job Order',  
        DataBefore: '',  
        DataAfter: JSON.stringify(data),  
        UserName: user.name,  
        IpAddress: req.ip,  
        ActivityDate: new Date(),  
        Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),  
        OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),  
        AppSource: 'Desktop',  
        created_by: user.sub,  
        updated_by: user.sub,  
      },  
    });  
  }  
  
  private prepareStagingRecords(  
    batch: AcknowledgeDto[],  
    user: any,  
  ): any[] {  
    return batch.map((acknowledge) => ({  
      job_order_no: acknowledge.no,  
      petugas: acknowledge.officer_name,  
      reason: `Job Order ditugaskan Kepada ${acknowledge.officer_name}`,  
      staging_id: 2,  
      created_by: user.sub,  
      updated_by: user.sub,  
    }));  
  }  
  
  private async updateSLARecords(  
    prisma: Prisma.TransactionClient,  
    batch: AcknowledgeDto[],  
    user: any,  
  ): Promise<{ count: number }> {  
    const slaRecords = await prisma.sLA.findMany({  
      where: {  
        job_order_no: {  
          in: batch.map((item) => item.no),  
        },  
        status: 'Open',  
        deleted_at: null,  
      },  
      select: { id: true },  
    });  
  
    return await prisma.sLA.updateMany({  
      where: {  
        id: {  
          in: slaRecords.map((sla) => sla.id),  
        },  
      },  
      data: {  
        status: 'Acknowledge',  
        updated_at: new Date(),  
        updated_by: user.sub,  
      },  
    });  
  }  
  
  private async cleanupFiles(files: Express.Multer.File[]): Promise<void> {  
    try {  
      await Promise.all(  
        files.map((file) =>  
          fs.promises.unlink(file.path).catch((err) =>  
            console.error(`Failed to delete file ${file.path}:`, err),  
          ),  
        ),  
      );  
    } catch (error) {  
      console.error('Error cleaning up files:', error);  
    }  
  }  
  
  private validateRow(  
    row: any,  
    rowNumber: number,  
    existJobOrder: any,  
  ): ValidationResult {  
    const errors: ValidationError[] = [];  
    const requiredFields = [  
      { cell: 'B', name: 'NO. JO' },  
      { cell: 'BO', name: 'NAMA PETUGAS' },  
    ];  
  
    // Validate required fields  
    requiredFields.forEach((field) => {  
      if (!row.getCell(field.cell).value) {  
        errors.push({  
        row: rowNumber,  
          column: field.name,  
          value: null,  
          message: `${field.name} tidak boleh kosong`,  
        });  
      }  
    });  
  
    // Validate job order existence  
    if (row.getCell('B').value && !existJobOrder) {  
      errors.push({  
        row: rowNumber,  
        column: 'NO. JO',  
        value: row.getCell('B').value.toString(),  
        message: 'NO. JO tidak ditemukan',  
      });  
    }  
  
    if (errors.length === 0) {  
      return {  
        isValid: true,  
        data: {  
          no: row.getCell('B').value.toString(),  
          officer_name: row.getCell('BO').value.toString(),  
        },  
        errors: [],  
      };  
    }  
  
    return {  
      isValid: false,  
      data: null,  
      errors,  
    };  
  }  
  
  private async validateJobOrders(rows: any[]): Promise<any[]> {  
    return await Promise.all(  
      rows  
        .map((row) => row.values)  
        .map((item) =>  
          this.jobOrderService.findOneBy({  
            no: item[2],  
            status: 'Open',  
          }),  
        ),  
    );  
  }

  @Get('template-acknowledge/download')
  async downloadTemplateBulkAcknowledge(@Res() res: Response) {
    const jobOrder = await this.jobOrderService.getAll({
      status: 'Open',
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(
      'templates/bulk/job-order-acknowledge-template.xlsx',
      {
        ignoreNodes: ['dataValidations'],
      },
    );

    const worksheet = workbook.getWorksheet(1);

    let row = 4;
    for (let i = 1; i <= jobOrder.length; i++) {
      worksheet.getCell(`A${row}`).value = i;
      worksheet.getCell(`B${row}`).value = jobOrder[i - 1].no;
      worksheet.getCell(`C${row}`).value = jobOrder[i - 1].region.code;
      worksheet.getCell(`D${row}`).value = jobOrder[i - 1].vendor.code;
      worksheet.getCell(`E${row}`).value = jobOrder[i - 1].type;
      worksheet.getCell(`F${row}`).value = dayjs(jobOrder[i - 1].date).format(
        'DD-MMM-YY',
      );
      worksheet.getCell(`G${row}`).value = jobOrder[i - 1].mid;
      worksheet.getCell(`H${row}`).value = jobOrder[i - 1].tid;
      worksheet.getCell(`I${row}`).value = jobOrder[i - 1].merchant_name;
      worksheet.getCell(`J${row}`).value = jobOrder[i - 1].address1;
      worksheet.getCell(`K${row}`).value = jobOrder[i - 1].address2;
      worksheet.getCell(`L${row}`).value = jobOrder[i - 1].address3;
      worksheet.getCell(`M${row}`).value = jobOrder[i - 1].address4;
      worksheet.getCell(`N${row}`).value = jobOrder[i - 1].subdistrict;
      worksheet.getCell(`O${row}`).value = jobOrder[i - 1].village;
      worksheet.getCell(`P${row}`).value = jobOrder[i - 1].city;
      worksheet.getCell(`Q${row}`).value = jobOrder[i - 1].postal_code;
      worksheet.getCell(`R${row}`).value = jobOrder[i - 1].pic;
      worksheet.getCell(`S${row}`).value = jobOrder[i - 1].phone_number1;
      worksheet.getCell(`T${row}`).value = jobOrder[i - 1].phone_number2;
      worksheet.getCell(`U${row}`).value = jobOrder[i - 1].provider;
      worksheet.getCell(`V${row}`).value = jobOrder[i - 1].trx_type_mini_atm;
      worksheet.getCell(`W${row}`).value = jobOrder[i - 1].trx_type_visa;
      worksheet.getCell(`X${row}`).value = jobOrder[i - 1].trx_type_master;
      worksheet.getCell(`Y${row}`).value = jobOrder[i - 1].trx_type_jcb;
      worksheet.getCell(`Z${row}`).value = jobOrder[i - 1].trx_type_maestro;
      worksheet.getCell(`AA${row}`).value = jobOrder[i - 1].trx_type_gpn;
      worksheet.getCell(`AB${row}`).value =
        jobOrder[i - 1].trx_type_tapcash_topup;
      worksheet.getCell(`AC${row}`).value =
        jobOrder[i - 1].trx_type_tapcash_purchase;
      worksheet.getCell(`AD${row}`).value =
        jobOrder[i - 1].trx_type_qrcode_qris;
      worksheet.getCell(`AE${row}`).value =
        jobOrder[i - 1].trx_type_qrcode_linkaja;
      worksheet.getCell(`AF${row}`).value =
        jobOrder[i - 1].trx_type_contactless_master;
      worksheet.getCell(`AG${row}`).value =
        jobOrder[i - 1].trx_type_contractless_visa;
      worksheet.getCell(`AH${row}`).value =
        jobOrder[i - 1].edc_facility_cepp_plan1;
      worksheet.getCell(`AI${row}`).value =
        jobOrder[i - 1].edc_facility_cepp_plan2;
      worksheet.getCell(`AJ${row}`).value =
        jobOrder[i - 1].edc_facility_cepp_plan3;
      worksheet.getCell(`AK${row}`).value =
        jobOrder[i - 1].edc_facility_reedem_point;
      worksheet.getCell(`AL${row}`).value =
        jobOrder[i - 1].edc_facility_activation_keyinsales;
      worksheet.getCell(`AM${row}`).value =
        jobOrder[
          i - 1
        ].edc_facility_activation_keyinsales_keyinpreauth_completion;
      worksheet.getCell(`AN${row}`).value =
        jobOrder[i - 1].edc_facility_activation_keyinpreauth_completion;
      worksheet.getCell(`AO${row}`).value =
        jobOrder[i - 1].edc_facility_activation_preauth_completion;
      worksheet.getCell(`AP${row}`).value =
        jobOrder[i - 1].edc_facility_activation_keyinsales_preauth_completion;
      worksheet.getCell(`AQ${row}`).value =
        jobOrder[i - 1].edc_facility_offline;
      worksheet.getCell(`AR${row}`).value =
        jobOrder[i - 1].edc_facility_card_ver;
      worksheet.getCell(`AS${row}`).value = jobOrder[i - 1].edc_facility_refund;
      worksheet.getCell(`AT${row}`).value =
        jobOrder[i - 1].edc_facility_adjust_tip;
      worksheet.getCell(`AU${row}`).value = jobOrder[i - 1].trx_test_credit;
      worksheet.getCell(`AV${row}`).value = jobOrder[i - 1].trx_test_debit;
      worksheet.getCell(`AW${row}`).value = jobOrder[i - 1].trx_test_inquiry;
      worksheet.getCell(`AX${row}`).value = jobOrder[i - 1].trx_test_transfer;
      worksheet.getCell(`AY${row}`).value = jobOrder[i - 1].trx_test_jcb;
      worksheet.getCell(`AZ${row}`).value = jobOrder[i - 1].trx_test_gpn;
      worksheet.getCell(`BA${row}`).value = jobOrder[i - 1].trx_test_tapcash;
      worksheet.getCell(`BB${row}`).value = jobOrder[i - 1].trx_test_qris;
      worksheet.getCell(`BC${row}`).value = jobOrder[i - 1].trx_test_linkaja;
      worksheet.getCell(`BD${row}`).value =
        jobOrder[i - 1].trx_test_visa_contactless;
      worksheet.getCell(`BE${row}`).value =
        jobOrder[i - 1].trx_test_master_contactless;
      worksheet.getCell(`BF${row}`).value = jobOrder[i - 1].trx_test_instalment;
      worksheet.getCell(`BG${row}`).value =
        jobOrder[i - 1].trx_test_reedemption;
      worksheet.getCell(`BH${row}`).value = jobOrder[i - 1].thermal_paper;
      worksheet.getCell(`BI${row}`).value = jobOrder[i - 1].sticker_bni;
      worksheet.getCell(`BJ${row}`).value = jobOrder[i - 1].acrylic;
      worksheet.getCell(`BK${row}`).value = jobOrder[i - 1].description1;
      worksheet.getCell(`BL${row}`).value = jobOrder[i - 1].description2;
      worksheet.getCell(`BM${row}`).value = jobOrder[i - 1].merchant_category;
      worksheet.getCell(`BN${row}`).value = jobOrder[i - 1].ownership;
      row++;
    }

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=job-order-acknowledge-template.xlsx',
    );

    res.send(buffer);
  }

  @Get(':no_jo/show')
  async findOneJobOrder(@Param('no_jo') no_jo: string) {
    const find = await this.jobOrderService.findOne(no_jo);
    if (!find) throw new BadRequestException('NO. JO tidak ditemukan');

    return find;
  }

  @UseInterceptors(
    FileFieldsUploadInterceptor({
      name: ['evidence', 'optional'],
      dirPath: './uploads/job-order',
      prefixName: 'job-order-activity',
    }),
  )
  @Post('activity')
  async createActivity(
    @Body() createActivityJobOrderDto: CreateActivityJobOrderDto, createPreventiveMaintenanceReportDto: CreatePreventiveMaintenanceReportDto,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @User() user: any,
    @Req() req: Request,
  ) {
    try {
      console.log(files);
      if (!files['evidence'] || files['evidence'].length == 0) {
        throw new BadRequestException('Bukti kunjungan tidak boleh kosong');
      }

      let mediaEvidence: { media_id: number }[] = [];
      mediaEvidence = await this.mediaService.insertMediaData(files['evidence']);
      
      let mediaOptional: { media_id: number }[] = [];
      if (files['optional'] && files['optional'].length > 0) {
        mediaOptional = await this.mediaService.insertMediaData(
          files['optional'],
        );
      }

      const jobOrder = await this.jobOrderService.findOne(createActivityJobOrderDto.no_jo);
      if (!jobOrder) throw new BadRequestException('NO. JO tidak ditemukan');  

      const isCMJobOrder = jobOrder.type === 'CM Replace';  
      
      if (!jobOrder.tid) {  
        throw new BadRequestException('TID is not valid or does not exist.');  
      }  
      
      await this.jobOrderService.updateByNoJo(createActivityJobOrderDto.no_jo, {  
        status: createActivityJobOrderDto.status,  
      });  

      
      let report;  

      if (jobOrder.type === 'Preventive Maintenance') {  
        report = await this.jobOrderService.createPreventiveMaintenanceReport(  
          {  
            job_order_no: createActivityJobOrderDto.no_jo,  
            status: createActivityJobOrderDto.status,  
            nominal: jobOrder.nominal_awal, 
            status_approve: 'Waiting',  
            vendor_id: jobOrder.vendor_id,  
            mid: jobOrder.mid,  
            edc_brand: createActivityJobOrderDto.edc_brand,  
            edc_brand_type: createActivityJobOrderDto.edc_brand_type,  
            edc_serial_number: createActivityJobOrderDto.edc_serial_number,  
            edc_note: createActivityJobOrderDto.edc_note,  
            edc_action: createActivityJobOrderDto.edc_action,  
            information: createActivityJobOrderDto.information,  
            cancel_reason: createActivityJobOrderDto.cancel_reason,
            arrival_time: new Date(createActivityJobOrderDto.arrival_time),  
            start_time: new Date(createActivityJobOrderDto.start_time),  
            end_time: new Date(createActivityJobOrderDto.end_time),  
            communication_line: createActivityJobOrderDto.communication_line,  
            direct_line_number: createActivityJobOrderDto.direct_line_number,  
            simcard_provider: createActivityJobOrderDto.simcard_provider,  
            paper_supply: createActivityJobOrderDto.paper_supply,  
            merchant_pic: createActivityJobOrderDto.merchant_pic,  
            merchant_pic_phone: createActivityJobOrderDto.merchant_pic_phone,  
            swipe_cash_indication: createActivityJobOrderDto.swipe_cash_indication,  
          },  
          mediaEvidence,  
          mediaOptional,  
        );  
      } else {  
        report = await this.jobOrderService.createActivityReport(  
          {  
            job_order_no: createActivityJobOrderDto.no_jo,  
            status: createActivityJobOrderDto.status,  
            nominal: jobOrder.nominal_awal,
            status_approve: 'Waiting',  
            edc_brand: createActivityJobOrderDto.edc_brand,  
            edc_brand_type: createActivityJobOrderDto.edc_brand_type,  
            edc_serial_number: createActivityJobOrderDto.edc_serial_number,  
            edc_note: createActivityJobOrderDto.edc_note,  
            edc_action: createActivityJobOrderDto.edc_action,  
            edc_second_brand: isCMJobOrder ? createActivityJobOrderDto.edc_second_brand : undefined,  
            edc_second_brand_type: isCMJobOrder ? createActivityJobOrderDto.edc_second_brand_type : undefined,  
            edc_second_serial_number: isCMJobOrder ? createActivityJobOrderDto.edc_second_serial_number : undefined,  
            edc_second_note: isCMJobOrder ? createActivityJobOrderDto.edc_second_note : undefined,  
            edc_second_action: isCMJobOrder ? createActivityJobOrderDto.edc_second_action : undefined, 
            information: createActivityJobOrderDto.information,  
            cancel_reason: createActivityJobOrderDto.cancel_reason,
            arrival_time: new Date(createActivityJobOrderDto.arrival_time),  
            start_time: new Date(createActivityJobOrderDto.start_time),  
            end_time: new Date(createActivityJobOrderDto.end_time),  
            communication_line: createActivityJobOrderDto.communication_line,  
            direct_line_number: createActivityJobOrderDto.direct_line_number,  
            simcard_provider: createActivityJobOrderDto.simcard_provider,  
            paper_supply: createActivityJobOrderDto.paper_supply,  
            merchant_pic: createActivityJobOrderDto.merchant_pic,  
            merchant_pic_phone: createActivityJobOrderDto.merchant_pic_phone,  
            swipe_cash_indication: createActivityJobOrderDto.swipe_cash_indication,  
          },  
          mediaEvidence,  
          mediaOptional,  
        );  
      }  

      if (createActivityJobOrderDto.products?.length > 0) {  
        await this.jobOrderService.createManyActivityReportProduct(  
          createActivityJobOrderDto.products.map((item) => ({  
            job_order_report_id: report.id,  
            pm_report_id: jobOrder.type === 'Preventive Maintenance' ? report.id : null,  
            ...item,
          })),  
        );  
      }  

      await this.jobOrderService.createActivityReportEdcEquipmentDongle({  
        job_order_report: jobOrder.type === 'Preventive Maintenance' ? undefined : {  
          connect: { id: report.id }, 
        },  
        pm_report: jobOrder.type === 'Preventive Maintenance' ? { connect: { id: report.id } } : undefined,  
        battery_cover: createActivityJobOrderDto.edc_dongle_equipment?.includes('battery_cover'),  
        battery: createActivityJobOrderDto.edc_dongle_equipment?.includes('battery'),  
        edc_adapter: createActivityJobOrderDto.edc_dongle_equipment?.includes('edc_adapter'),  
        edc_bracket: createActivityJobOrderDto.edc_dongle_equipment?.includes('edc_bracket'),  
        edc_holder: createActivityJobOrderDto.edc_dongle_equipment?.includes('edc_holder'),  
        dongle_holder: createActivityJobOrderDto.edc_dongle_equipment?.includes('dongle_holder'),  
        dongle_adapter: createActivityJobOrderDto.edc_dongle_equipment?.includes('dongle_adapter'),  
        cable_ecr: createActivityJobOrderDto.edc_dongle_equipment?.includes('cable_ecr'),  
        cable_lan: createActivityJobOrderDto.edc_dongle_equipment?.includes('cable_lan'),  
        cable_telephone_line: createActivityJobOrderDto.edc_dongle_equipment?.includes('cable_telephone_line'),  
        mid_tid: createActivityJobOrderDto.edc_dongle_equipment?.includes('mid_tid'),  
        magic_box: createActivityJobOrderDto.edc_dongle_equipment?.includes('magic_box'),  
        transaction_guide: createActivityJobOrderDto.edc_dongle_equipment?.includes('transaction_guide'),  
        pin_cover: createActivityJobOrderDto.edc_dongle_equipment?.includes('pin_cover'),  
        telephone_line_splitter: createActivityJobOrderDto.edc_dongle_equipment?.includes('telephone_line_splitter'),  
        sticker_bank: createActivityJobOrderDto.edc_dongle_equipment?.includes('sticker_bank'),  
        sticer_dongle: createActivityJobOrderDto.edc_dongle_equipment?.includes('sticer_dongle'),  
        sticer_gpn: createActivityJobOrderDto.edc_dongle_equipment?.includes('sticer_gpn'),  
        sticker_qrcode: createActivityJobOrderDto.edc_dongle_equipment?.includes('sticker_qrcode'),  
      });

      await this.jobOrderService.createActivityReportMaterialPromo({  
        job_order_report_id: jobOrder.type === 'Preventive Maintenance' ? null : report.id,  
        pm_report_id: jobOrder.type === 'Preventive Maintenance' ? report.id : null,  
        flyer: createActivityJobOrderDto.material_promo?.includes('flyer'),  
        tent_card: createActivityJobOrderDto.material_promo?.includes('tent_card'),  
        holder_card: createActivityJobOrderDto.material_promo?.includes('holder_card'),  
        holder_pen: createActivityJobOrderDto.material_promo?.includes('holder_pen'),  
        holder_bill: createActivityJobOrderDto.material_promo?.includes('holder_bill'),  
        sign_pad: createActivityJobOrderDto.material_promo?.includes('sign_pad'),  
        pen: createActivityJobOrderDto.material_promo?.includes('pen'),  
        acrylic_open_close: createActivityJobOrderDto.material_promo?.includes('acrylic_open_close'),  
        logo_sticker: createActivityJobOrderDto.material_promo?.includes('logo_sticker'),  
        banner: createActivityJobOrderDto.material_promo?.includes('banner'),  
      });  

      await this.jobOrderService.createActivityReportMaterialTraining({  
        job_order_report_id: jobOrder.type === 'Preventive Maintenance' ? null : report.id,  
        pm_report_id: jobOrder.type === 'Preventive Maintenance' ? report.id : null,  
        fraud_awareness: createActivityJobOrderDto.material_training?.includes('fraud_awareness'),  
        sale_void_settlement_logon: createActivityJobOrderDto.material_training?.includes('sale_void_settlement_logon'),  
        installment: createActivityJobOrderDto.material_training?.includes('installment'),  
        audit_report: createActivityJobOrderDto.material_training?.includes('audit_report'),  
        top_up: createActivityJobOrderDto.material_training?.includes('top_up'),  
        redeem_point: createActivityJobOrderDto.material_training?.includes('redeem_point'),  
        cardverif_preauth_offline: createActivityJobOrderDto.material_training?.includes('cardverif_preauth_offline'),  
        manual_key_in: createActivityJobOrderDto.material_training?.includes('manual_key_in'),  
        tips_adjust: createActivityJobOrderDto.material_training?.includes('tips_adjust'),  
        mini_atm: createActivityJobOrderDto.material_training?.includes('mini_atm'),  
        fare_non_fare: createActivityJobOrderDto.material_training?.includes('fare_non_fare'),  
        dcc_download_bin: createActivityJobOrderDto.material_training?.includes('dcc_download_bin'),  
        first_level_maintenance: createActivityJobOrderDto.material_training?.includes('first_level_maintenance'),  
        transaction_receipt_storage: createActivityJobOrderDto.material_training?.includes('transaction_receipt_storage'),  
      });  

      await this.auditService.create({  
        Url: req.url,  
        ActionName: 'Update Activity Job Order',  
        MenuName: 'Job Order',  
        DataBefore: '',  
        DataAfter: JSON.stringify(report),  
        UserName: user.name,  
        IpAddress: req.ip,  
        ActivityDate: new Date(),  
        Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),  
        OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),  
        AppSource: 'Desktop',  
        created_by: user.sub,  
        updated_by: user.sub,  
      });  

      // const location = `${jobOrder.address1}, ${jobOrder.address2}, ${jobOrder.address3}, ${jobOrder.address4} ${jobOrder.postal_code}`;  

      //  const documentVendorPayload = {  
      //   job_order_no: jobOrder.no,  
      //   vendor_id: jobOrder.vendor_id,  
      //   region_id: jobOrder.region_id,  
      //   mid: jobOrder.mid,  
      //   tid: jobOrder.tid,   
      //   location: location,  
      //   created_by: user.sub,  
      //   updated_by: user.sub,  
      // };  

      //  await this.docVendorService.create(documentVendorPayload);  

      const approveData = {  
        id_jobOrder: jobOrder.id,  
        jo_report_id: jobOrder.type === 'Preventive Maintenance' ? null : report.id,  
        pm_report_id: jobOrder.type === 'Preventive Maintenance' ? report.id : null,  
        vendor_id: jobOrder.vendor_id,  
        region_id: jobOrder.region_id,  
        status: 'Waiting',  
        created_by: user.sub,  
        updated_by: user.sub,  
      };  

      await this.approveService.create(approveData);  

      const jobOrderType = jobOrder.type;

      const serialNumber = jobOrder.type === 'Preventive Maintenance' 
        ? createActivityJobOrderDto.edc_serial_number 
        : createActivityJobOrderDto.edc_serial_number;

      if (!serialNumber) {
        throw new BadRequestException('Serial Number tidak tersedia untuk membuat Received In/Out.');
      }

      const createReceivedIn = async () => {
      const edcTerpasang = await this.edcService.findEDCMachineBySerialNumber(serialNumber);
        if (!edcTerpasang) {
          throw new BadRequestException(`EDCTerpasang dengan Serial Number ${serialNumber} tidak ditemukan.`);
        }

        const receivedInDto = {
          id_joborder: jobOrder.id,
          id_edc: edcTerpasang.id,
          id_region: jobOrder.region_id,
          id_vendor: jobOrder.vendor_id,
          id_merchant: edcTerpasang.merchant_id,
          serial_number: serialNumber,
          tid: jobOrder.tid,
        };

        await this.receivedInService.create(receivedInDto);
      };

      const createReceivedOut = async () => {
        const edcMachine = await this.edcService.findEDCMachineBySerialNumber(serialNumber);
        if (!edcMachine) {
          throw new BadRequestException(`ElectronicDataCaptureMachine dengan Serial Number ${serialNumber} tidak ditemukan.`);
        }

        const receivedOutDto = {
          id_joborder: jobOrder.id,
          id_edc: edcMachine.id,
          id_region: jobOrder.region_id,
          id_vendor: jobOrder.vendor_id,
          id_merchant: edcMachine.merchant_id,
          serial_number: serialNumber,
          tid: jobOrder.tid,
          status: 'waiting', 
        };

        await this.receivedOutService.create(receivedOutDto);
      };

      if (jobOrderType === 'New Installation') {
        await createReceivedOut();
      } else if (jobOrderType === 'Withdrawal') {
        await createReceivedIn();
      } else if (jobOrderType === 'CM Replace') {
        await createReceivedIn();
        await createReceivedOut();
      }


      const mediaEvidencePaths = await Promise.all(  
        mediaEvidence.map(media => this.mediaService.findMediaById(media.media_id))  
      );  
      
      const mediaOptionalPaths = await Promise.all(  
        mediaOptional.map(media => this.mediaService.findMediaById(media.media_id))  
      );  
  
      const photoEvidencePaths = mediaEvidencePaths.map(media => media.path);  
      const photoOptionalPaths = mediaOptionalPaths.map(media => media.path);  
  
      let stagingId = createActivityJobOrderDto.status === 'Cancel' ? 6 : 4;  
  
      const stagingJobOrderData = {  
        job_order_no: jobOrder.no,  
        jo_report_id: jobOrder.type === 'Preventive Maintenance' ? null : report.id,  
        pm_report_id: jobOrder.type === 'Preventive Maintenance' ? report.id : null,  
        photo_evidence: photoEvidencePaths.join(','),  
        reason: report.information,  
        cancel_type: report.cancel_reason,
        photo_optional: photoOptionalPaths.join(','),   
        created_by: user.sub,  
        updated_by: user.sub,  
        staging_id: stagingId,  
      };  
  
      await this.prisma.stagingJobOrder.create({  
        data: stagingJobOrderData,  
      });  

      const amount = 1;  
      const location = `${jobOrder.address1}, ${jobOrder.address2}, ${jobOrder.address3}, ${jobOrder.address4} ${jobOrder.postal_code}`;  

      await this.prisma.activityVendorReport.create({
        data:
        {  
            job_order_no: createActivityJobOrderDto.no_jo,  
            vendor_id: jobOrder.vendor_id,  
            mid: jobOrder.mid,  
            tid: jobOrder.tid,  
            status: createActivityJobOrderDto.status,  
            nominal: jobOrder.nominal_awal,
            jenis: jobOrder.type,  
            location: location,
            description: this.getDescriptionByJobOrderType(jobOrder.type),    
            amount: amount,  
            petugas: jobOrder.officer_name,  
            edc_brand: createActivityJobOrderDto.edc_brand,  
            edc_brand_type: createActivityJobOrderDto.edc_brand_type,  
            edc_serial_number: createActivityJobOrderDto.edc_serial_number,  
            edc_note: createActivityJobOrderDto.edc_note,  
            edc_action: createActivityJobOrderDto.edc_action,  
            information: createActivityJobOrderDto.information,  
            cancel_reason: createActivityJobOrderDto.cancel_reason,
            arrival_time:  new Date(createActivityJobOrderDto.arrival_time),  
            start_time:  new Date(createActivityJobOrderDto.start_time),  
            end_time:  new Date(createActivityJobOrderDto.end_time),  
            communication_line: createActivityJobOrderDto.communication_line,  
            direct_line_number: createActivityJobOrderDto.direct_line_number,  
            simcard_provider: createActivityJobOrderDto.simcard_provider,  
            paper_supply: createActivityJobOrderDto.paper_supply,  
            merchant_pic: createActivityJobOrderDto.merchant_pic,  
            merchant_pic_phone: createActivityJobOrderDto.merchant_pic_phone,  
            swipe_cash_indication: createActivityJobOrderDto.swipe_cash_indication,  
            created_by: user.sub,  
            updated_by: user.sub,  
          }
      })

      // Penjumlahan Nominal SLA
      // const nominalAwal = Number(jobOrder.nominal_awal) || 0;  
      // let totalNominal = nominalAwal; 

      // if (jobOrder.type === 'Preventive Maintenance') {  
      //   await this.jobOrderService.updateNominalPMByNoJo(createActivityJobOrderDto.no_jo, {  
      //     nominal: totalNominal.toString(),  
      //   });   
      // } else {  
      //   await this.jobOrderService.updateNominalByNoJo(createActivityJobOrderDto.no_jo, {  
      //     nominal: totalNominal.toString(),  
      //   });  
      // }     
      try {  
        const sla = await this.prisma.sLA.findFirst({  
          where: {  
            job_order_no: createActivityJobOrderDto.no_jo,  
            status: 'Acknowledge',  
            deleted_at: null  
          }  
        });  
      
        if (sla) {  
          const slaStatus = createActivityJobOrderDto.status === 'Cancel' ? 'Cancel' : 'Done';  

          let newStatusSla = sla.status_sla;  
          if (sla.status_sla !== 'Not Archived') {  
            newStatusSla = 'Archived';  
          }  
          
          await this.prisma.sLA.update({  
            where: { id: sla.id },  
            data: {  
              status: slaStatus,  
              solved_time: new Date(), 
              updated_at: new Date(),  
              updated_by: user.sub,
              status_sla: newStatusSla,
            }  
          });  
      
          console.log(`Updated SLA status to ${slaStatus} for job order: ${createActivityJobOrderDto.no_jo}`);  
        } else {  
          console.warn(`No open SLA found for job order: ${createActivityJobOrderDto.no_jo}`);  
        }  
      } catch (error) {  
        console.error(`Failed to update SLA for job order ${createActivityJobOrderDto.no_jo}:`, error);  
      }  
      return report;  
    } catch (error) {  
      if (error instanceof BadRequestException) {  
        throw error;  
      } else {  
        console.error('Error creating activity:', error);  
        throw new HttpException(  
          {  
            status: {  
              code: HttpStatus.UNPROCESSABLE_ENTITY,  
              description: 'Validation error',  
            },  
            result: {  
              errors: error.response?.message || error.message,  
            },  
          },  
          HttpStatus.UNPROCESSABLE_ENTITY,  
        );  
      }  
    }  
  }
  
  private getDescriptionByJobOrderType(type: string): string {  
    switch (type) {  
      case 'New Installation':  
        return 'Pemasangan EDC';  
      case 'Withdrawal':  
        return 'Penarikan EDC';  
      case 'CM Replace':  
        return 'Pergantian EDC';  
      case 'Preventive Maintenance':  
        return 'Maintenance EDC';  
      case 'CM Re-init':  
        return 'Install Ulang EDC';  
      default:  
        return '';  
    }  
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