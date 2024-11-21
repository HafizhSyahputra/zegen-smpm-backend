import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JobOrder, Prisma, SLA_Region, StagingJobOrder } from '@prisma/client';
import { ColumnJobOrder, JobOrderStatus } from '@smpm/common/constants/enum';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { transformEntity } from '@smpm/common/transformer/entity.transformer';
import { convertStringToObjectContains } from '@smpm/common/utils/string';
import { AcknowledgeDto } from '@smpm/electronic-data-capture/dto/acknowledge.dto';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { PageOptionJobOrderDto } from './dto/page-option-job-order.dto';
import { JobOrderEntity } from './entities/job-order.entity';
import { PaymentService } from '@smpm/payment/payment.service';

@Injectable()
export class JobOrderService {
  constructor(private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async findAllOpen(
    pageOptionJobOrderDto: PageOptionJobOrderDto,
  ): Promise<PageDto<JobOrderEntity>> {
    const filter: Prisma.JobOrderWhereInput = {};
    const order: Prisma.JobOrderOrderByWithRelationInput = {};

    if (pageOptionJobOrderDto.search && pageOptionJobOrderDto.search_by)
      filter.OR = pageOptionJobOrderDto.search_by.map((column) => {
        if (column.includes('.'))
          return convertStringToObjectContains(
            column,
            pageOptionJobOrderDto.search,
          );
        return {
          [column]: {
            contains: pageOptionJobOrderDto.search,
          },
        };
      });

    if (pageOptionJobOrderDto.search && !pageOptionJobOrderDto.search_by)
      filter.OR = Object.keys(ColumnJobOrder)
        .filter(
          (x) =>
            x != ColumnJobOrder.id &&
            x != ColumnJobOrder.region_id &&
            x != ColumnJobOrder.vendor_id,
        )
        .map((column) => {
          if (column.includes('.'))
            return convertStringToObjectContains(
              column,
              pageOptionJobOrderDto.search,
            );
          return {
            [column]: {
              contains: pageOptionJobOrderDto.search,
            },
          };
        });

    pageOptionJobOrderDto.order_by
      ? (order[pageOptionJobOrderDto.order_by] = pageOptionJobOrderDto.order)
      : (order.updated_at = pageOptionJobOrderDto.order);

    if (pageOptionJobOrderDto.region_id)
      filter.region_id = {
        in: pageOptionJobOrderDto.region_id,
      };

    if (pageOptionJobOrderDto.vendor_id)
      filter.vendor_id = {
        in: pageOptionJobOrderDto.vendor_id,
      };

    if (pageOptionJobOrderDto.type)
      filter.type = {
        in: pageOptionJobOrderDto.type,
      };

    if (pageOptionJobOrderDto.status)
      filter.status = {
        in: pageOptionJobOrderDto.status,
      };

    if (pageOptionJobOrderDto.ownership)
      filter.ownership = {
        in: pageOptionJobOrderDto.ownership,
      };

    const [data, countAll] = await Promise.all([
      this.prismaService.jobOrder.findMany({
        where: {
          ...filter,
          status: JobOrderStatus.Open,
        },
        orderBy: order,
        skip: pageOptionJobOrderDto.skip,
        take: pageOptionJobOrderDto.take,
        include: {
          region: true,
          vendor: true,
          merchant: true,
        },
      }),
      this.prismaService.jobOrder.count({
        where: {
          ...filter,
          status: JobOrderStatus.Open,
          deleted_at: null,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: countAll,
      pageOptionsDto: pageOptionJobOrderDto,
    });

    return new PageDto(transformEntity(JobOrderEntity, data), pageMetaDto);
  }

  async findAllActivity(
    pageOptionJobOrderDto: PageOptionJobOrderDto,
  ): Promise<PageDto<JobOrderEntity>> {
    const filter: Prisma.JobOrderWhereInput = {};
    const order: Prisma.JobOrderOrderByWithRelationInput = {};

    filter.status = {
      not: JobOrderStatus.Open,
    };

    if (pageOptionJobOrderDto.search && pageOptionJobOrderDto.search_by)
      filter.OR = pageOptionJobOrderDto.search_by.map((column) => {
        if (column.includes('.'))
          return convertStringToObjectContains(
            column,
            pageOptionJobOrderDto.search,
          );
        return {
          [column]: {
            contains: pageOptionJobOrderDto.search,
          },
        };
      });

    if (pageOptionJobOrderDto.search && !pageOptionJobOrderDto.search_by)
      filter.OR = Object.keys(ColumnJobOrder)
        .filter(
          (x) =>
            x != ColumnJobOrder.id &&
            x != ColumnJobOrder.region_id &&
            x != ColumnJobOrder.vendor_id,
        )
        .map((column) => {
          if (column.includes('.'))
            return convertStringToObjectContains(
              column,
              pageOptionJobOrderDto.search,
            );
          return {
            [column]: {
              contains: pageOptionJobOrderDto.search,
            },
          };
        });

    pageOptionJobOrderDto.order_by
      ? (order[pageOptionJobOrderDto.order_by] = pageOptionJobOrderDto.order)
      : (order.updated_at = pageOptionJobOrderDto.order);

    if (pageOptionJobOrderDto.region_id)
      filter.region_id = {
        in: pageOptionJobOrderDto.region_id,
      };

    if (pageOptionJobOrderDto.vendor_id)
      filter.vendor_id = {
        in: pageOptionJobOrderDto.vendor_id,
      };

    if (pageOptionJobOrderDto.type)
      filter.type = {
        in: pageOptionJobOrderDto.type,
      };

    if (pageOptionJobOrderDto.status)
      filter.status.in = pageOptionJobOrderDto.status;

    if (pageOptionJobOrderDto.ownership)
      filter.ownership = {
        in: pageOptionJobOrderDto.ownership,
      };

    const [data, countAll] = await Promise.all([
      this.prismaService.jobOrder.findMany({
        where: {
          ...filter,
        },
        orderBy: order,
        skip: pageOptionJobOrderDto.skip,
        take: pageOptionJobOrderDto.take,
        include: {
          region: true,
          vendor: true,
          merchant: true,
          JobOrderReport: {
            include: {
              MediaJobOrderReportProofOfVisit: true,
              MediaJobOrderReportOptionalPhoto: true,
              JobOrderReportEdcEquipmentDongle: true,
              JobOrderReportMaterialPromo: true,
              JobOrderReportProduct: true,
              JobOrderReportMaterialTraining: true,
            },
          },
          PreventiveMaintenanceReport: {
            include: {
              MediaJobOrderReportProofOfVisit: true,
              MediaJobOrderReportOptionalPhoto: true,
              JobOrderReportEdcEquipmentDongle: true,
              JobOrderReportMaterialPromo: true,
              JobOrderReportProduct: true,
              JobOrderReportMaterialTraining: true,
            },
          },
        },
      }),
      this.prismaService.jobOrder.count({
        where: {
          ...filter,
          deleted_at: null,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: countAll,
      pageOptionsDto: pageOptionJobOrderDto,
    });

    return new PageDto(data, pageMetaDto);
  }

  getAllJO() {
    return this.prismaService.jobOrder.findMany({
      include: {
        region: true,
        vendor: true,
        merchant: true,
        JobOrderReport: {
          include: {
            MediaJobOrderReportProofOfVisit: true,
            MediaJobOrderReportOptionalPhoto: true,
            JobOrderReportEdcEquipmentDongle: true,
            JobOrderReportMaterialPromo: true,
            JobOrderReportProduct: true,
            JobOrderReportMaterialTraining: true,
          },
        },
        PreventiveMaintenanceReport: {
          include: {
            MediaJobOrderReportProofOfVisit: true,
            MediaJobOrderReportOptionalPhoto: true,
            JobOrderReportEdcEquipmentDongle: true,
            JobOrderReportMaterialPromo: true,
            JobOrderReportProduct: true,
            JobOrderReportMaterialTraining: true,
          },
        }
      },
    });
  }

  findOne(no_jo: string): Promise<JobOrder> {
    const data = this.prismaService.jobOrder.findUnique({
      where: {
        no: no_jo,
      },
      include: {
        region: true,
        vendor: true,
        merchant: true,
        JobOrderReport: {
          include: {
            MediaJobOrderReportProofOfVisit: true,
            MediaJobOrderReportOptionalPhoto: true,
            JobOrderReportEdcEquipmentDongle: true,
            JobOrderReportMaterialPromo: true,
            JobOrderReportProduct: true,
            JobOrderReportMaterialTraining: true,
          },
        },
        PreventiveMaintenanceReport: {
          include: {
            MediaJobOrderReportProofOfVisit: true,
            MediaJobOrderReportOptionalPhoto: true,
            JobOrderReportEdcEquipmentDongle: true,
            JobOrderReportMaterialPromo: true,
            JobOrderReportProduct: true,
            JobOrderReportMaterialTraining: true,
          },
        }
      },
    });

    return data;
  }

  async findStagingNoJo(no_jo: string): Promise<StagingJobOrder[]> {  
    const data = await this.prismaService.stagingJobOrder.findMany({  
      where: {  
        job_order_no: no_jo,  
      },  
      include: {  
        jobOrder: true,  
        staging:true,
        jobOrderReport: {  
          include: {  
            MediaJobOrderReportProofOfVisit: true,  
            MediaJobOrderReportOptionalPhoto: true,  
            JobOrderReportEdcEquipmentDongle: true,  
            JobOrderReportMaterialPromo: true,  
            JobOrderReportProduct: true,  
            JobOrderReportMaterialTraining: true,  
          },  
        },  
        preventiveMaintenanceReport: {  
          include: {  
            MediaJobOrderReportProofOfVisit: true,  
            MediaJobOrderReportOptionalPhoto: true,  
            JobOrderReportEdcEquipmentDongle: true,  
            JobOrderReportMaterialPromo: true,  
            JobOrderReportProduct: true,  
            JobOrderReportMaterialTraining: true,  
          },  
        },  
      },  
    });  
  
    return data;  
  }  

  // async createMany(data: Prisma.JobOrderUncheckedCreateInput[]) {  
  //   try {  
  //     return await this.prismaService.jobOrder.createMany({  
  //       data,  
  //     });  
  //   } catch (error) {  
  //     console.error('Error saat menyimpan job orders:', error);  
  //     throw new BadRequestException('Gagal menyimpan job orders');  
  //   }  
  // }
  
  private generateInvoiceCode(): string {
    // Contoh sederhana: INV + timestamp
    return `INV-${Date.now()}`;
  }

  
  async createMany(data: Prisma.JobOrderUncheckedCreateInput[], vendorId: number | null, createdBy: number) {
    try {
      // 1. Buat Job Orders
      const createdJobOrders = await this.prismaService.jobOrder.createMany({
        data: data.map(item => ({
          ...item,
          created_by: createdBy,
          updated_by: createdBy
        }))
      });
  
      // 2. Dapatkan vendor_id dari data pertama
      const firstJobOrder = data[0];
      const actualVendorId = vendorId || firstJobOrder.vendor_id;
  
      if (!actualVendorId) {
        throw new BadRequestException('vendor_id tidak ditemukan dalam data');
      }
  
      // 3. Dapatkan semua Job Orders yang baru dibuat
      const createdJobs = await this.prismaService.jobOrder.findMany({
        where: {
          vendor_id: actualVendorId,
          created_at: {
            gte: new Date(new Date().getTime() - 5000) // Ambil yang dibuat dalam 5 detik terakhir
          }
        },
        select: {
          id: true,
          nominal_awal: true
        }
      });
  
      if (createdJobs.length === 0) {
        throw new BadRequestException('Tidak ada job order yang berhasil dibuat');
      }
  
      // 4. Hitung total harga
      const totalHarga = createdJobs.reduce((sum, job) => {
        const nominal = job.nominal_awal ? parseFloat(job.nominal_awal) : 0;
        return sum + nominal;
      }, 0);
  
      // 5. Siapkan job order IDs
      const jobOrderIds = createdJobs.map(job => job.id);
  
      // 6. Buat atau update payment menggunakan transaction
      const payment = await this.prismaService.$transaction(async (prisma) => {
        return await this.paymentService.addJobOrdersToPayment({
          vendorId: actualVendorId,
          jobOrderIds,
          totalHarga,
          createdBy
        });
      });
  
      console.log('Created Payment:', payment); // Tambahkan log untuk debugging
  
      return {
        jobOrders: createdJobOrders,
        payment: payment,
        jobOrderIds: jobOrderIds,
        totalHarga: totalHarga
      };
  
    } catch (error) {
      console.error('Error dalam createMany:', error);
      throw new BadRequestException(`Gagal menyimpan job orders dan payment: ${error.message}`);
    }
  }


  async updatePreventiveType(id: number, preventiveType: string) {  
    try {  
      return await this.prismaService.jobOrder.update({  
        where: {  
          id: id,  
        },  
        data: {  
          preventive_type: preventiveType,  
        },  
      });  
    } catch (error) {  
      console.error('Error updating job order:', error);  
      throw new BadRequestException('Gagal memperbarui job order');  
    }  
  } 
  async updateNominal(id: number, nominal: string) {  
    return await this.prismaService.jobOrder.update({  
        where: { id },  
        data: {  
            nominal_awal: nominal,  
        },  
    });  
}

  async acknowlege(data: AcknowledgeDto[]) {
    await this.prismaService.$transaction(async () => {
      for (const item of data) {
        await this.prismaService.jobOrder.update({
          where: {
            no: item.no,
          },
          data: {
            officer_name: item.officer_name,
            status: 'Acknowledge',
          },
        });
      }
    });
  }

  async findSlaByGroupRegionAndScope(  
    groupRegionId: number,  
    merchantCategory: string,  
    type: string,  
  ): Promise<SLA_Region[]> {  
    return this.prismaService.sLA_Region.findMany({  
      where: {  
        group_region: groupRegionId,  
        action: type,  
        scope: merchantCategory,  
      },  
    });  
  }  

  async updateByNoJo(no_jo: string, data: Prisma.JobOrderUpdateInput) {
    return this.prismaService.jobOrder.update({
      where: {
        no: no_jo,
      },
      data,
    });
  }
  async updateNominalByNoJo(no_jo: string, data: Prisma.JobOrderReportUpdateInput) {  
     const jobOrderReports = await this.prismaService.jobOrderReport.findMany({  
      where: {  
        job_order_no: no_jo,  
      },  
    });  
  
     if (jobOrderReports.length === 0) {  
      throw new Error('JobOrderReport with no_jo not found');  
    }  
  
     const reportToUpdate = jobOrderReports[0]; 
  
    return this.prismaService.jobOrderReport.update({  
      where: {  
        id: reportToUpdate.id, 
      },  
      data,  
    });  
  }  
  
  async updateNominalPMByNoJo(no_jo: string, data: Prisma.PreventiveMaintenanceReportUpdateInput) {  
     const preventiveReports = await this.prismaService.preventiveMaintenanceReport.findMany({  
      where: {  
        job_order_no: no_jo,  
      },  
    });  
  
     if (preventiveReports.length === 0) {  
      throw new Error('PreventiveMaintenanceReport with no_jo not found');  
    }  
  
     const reportToUpdate = preventiveReports[0]; 
    return this.prismaService.preventiveMaintenanceReport.update({  
      where: {  
        id: reportToUpdate.id,    
      },  
      data,  
    });  
  }

  async updatePaymentWithJobOrderReport(jobOrderNo: string, reportId: number) {
    // Cari job order untuk mendapatkan payment terkait
    const jobOrder = await this.prismaService.jobOrder.findUnique({
      where: { no: jobOrderNo },
      select: { id: true }
    });
  
    if (!jobOrder) {
      throw new NotFoundException(`Job Order ${jobOrderNo} tidak ditemukan`);
    }
  
    // Cari payment yang memiliki job order ini
    const payment = await this.prismaService.payment.findFirst({
      where: {
        job_order_ids: {
          contains: jobOrder.id.toString()
        }
      }
    });
  
    if (payment) {
      // Update payment dengan menambahkan job order report ID
      const existingReportIds = payment.job_order_report_ids 
        ? JSON.parse(payment.job_order_report_ids) 
        : [];
      
      const updatedReportIds = [...existingReportIds, reportId];
  
      await this.prismaService.payment.update({
        where: { id_payment: payment.id_payment },
        data: {
          job_order_report_ids: JSON.stringify(updatedReportIds),
          updated_at: new Date()
        }
      });
    }
  }


  getAll(where: Prisma.JobOrderWhereInput = {}) {
    return this.prismaService.jobOrder.findMany({
      where,
      include: {
        region: true,
        vendor: true,
        merchant: true,
        JobOrderReport: {
          include: {
            MediaJobOrderReportProofOfVisit: true,
            MediaJobOrderReportOptionalPhoto: true,
            JobOrderReportEdcEquipmentDongle: true,
            JobOrderReportMaterialPromo: true,
            JobOrderReportProduct: true,
            JobOrderReportMaterialTraining: true,
          },
        },
        PreventiveMaintenanceReport: {
          include: {
            MediaJobOrderReportProofOfVisit: true,
            MediaJobOrderReportOptionalPhoto: true,
            JobOrderReportEdcEquipmentDongle: true,
            JobOrderReportMaterialPromo: true,
            JobOrderReportProduct: true,
            JobOrderReportMaterialTraining: true,
          },
        }
      },
    });
  }

  findMany(where: Prisma.JobOrderWhereInput = {}) {  
    return this.prismaService.jobOrder.findMany({  
      where,  
      include: {  
        region: true,  
        vendor: true,  
        merchant: true,  
        JobOrderReport: {  
          include: {  
            MediaJobOrderReportProofOfVisit: true,  
            MediaJobOrderReportOptionalPhoto: true,  
            JobOrderReportEdcEquipmentDongle: true,  
            JobOrderReportMaterialPromo: true,  
            JobOrderReportProduct: true,  
            JobOrderReportMaterialTraining: true,  
          },  
        },  
        PreventiveMaintenanceReport: {  
          include: {  
            MediaJobOrderReportProofOfVisit: true,  
            MediaJobOrderReportOptionalPhoto: true,  
            JobOrderReportEdcEquipmentDongle: true,  
            JobOrderReportMaterialPromo: true,  
            JobOrderReportProduct: true,  
            JobOrderReportMaterialTraining: true,  
          },  
        }  
      },  
    });  
  }


  findOneBy(where: Prisma.JobOrderWhereInput) {
    return this.prismaService.jobOrder.findFirst({
      where,
    });
  }
  async createActivityReport(
    data: Prisma.JobOrderReportUncheckedCreateInput,
    mediaEvidence?: { media_id: number }[],
    mediaOptional?: { media_id: number }[],
  ) {
    try {
      // Buat report
      const report = await this.prismaService.jobOrderReport.create({
        data: {
          ...data,
          MediaJobOrderReportProofOfVisit: {
            create: mediaEvidence,
          },
          MediaJobOrderReportOptionalPhoto: {
            create: mediaOptional,
          },
        },
      });
  
      // Cari job order terkait
      const jobOrder = await this.prismaService.jobOrder.findUnique({
        where: { no: data.job_order_no }
      });
  
      if (!jobOrder) {
        throw new NotFoundException(`Job Order ${data.job_order_no} not found`);
      }
  
      // Update payment
      await this.updatePaymentWithReport(jobOrder.id, report.id);
  
      return report;
    } catch (error) {
      console.error('Error creating activity report:', error);
      throw error;
    }
  }
  async createPreventiveMaintenanceReport(
    data: Prisma.PreventiveMaintenanceReportUncheckedCreateInput,
    mediaEvidence?: { media_id: number }[],
    mediaOptional?: { media_id: number }[],
  ) {
    try {
      // Buat report
      const report = await this.prismaService.preventiveMaintenanceReport.create({
        data: {
          ...data,
          MediaJobOrderReportProofOfVisit: {
            create: mediaEvidence,
          },
          MediaJobOrderReportOptionalPhoto: {
            create: mediaOptional,
          },
        },
      });
  
      // Cari job order terkait
      const jobOrder = await this.prismaService.jobOrder.findUnique({
        where: { no: data.job_order_no }
      });
  
      if (!jobOrder) {
        throw new NotFoundException(`Job Order ${data.job_order_no} not found`);
      }
  
      // Update payment
      await this.updatePaymentWithReport(jobOrder.id, report.id);
  
      return report;
    } catch (error) {
      console.error('Error creating PM report:', error);
      throw error;
    }
  }

  private async updatePaymentWithReport(jobOrderId: number, reportId: number) {
    try {
      // Cari payment yang memiliki job order ini
      const payment = await this.prismaService.payment.findFirst({
        where: {
          job_order_ids: {
            contains: jobOrderId.toString()
          }
        }
      });
  
      if (payment) {
        // Parse existing IDs
        const existingJobOrderIds = payment.job_order_ids 
          ? JSON.parse(payment.job_order_ids) 
          : [];
        const existingReportIds = payment.job_order_report_ids 
          ? JSON.parse(payment.job_order_report_ids) 
          : [];
  
        // Update payment dengan menambahkan report ID baru
        await this.prismaService.payment.update({
          where: { id_payment: payment.id_payment },
          data: {
            job_order_ids: JSON.stringify([...new Set([...existingJobOrderIds, jobOrderId])]),
            job_order_report_ids: JSON.stringify([...new Set([...existingReportIds, reportId])]),
            updated_at: new Date()
          }
        });
  
        console.log('Payment updated successfully:', {
          paymentId: payment.id_payment,
          jobOrderId,
          reportId,
          updatedJobOrderIds: [...new Set([...existingJobOrderIds, jobOrderId])],
          updatedReportIds: [...new Set([...existingReportIds, reportId])]
        });
      } else {
        console.warn(`No payment found for job order ID: ${jobOrderId}`);
      }
    } catch (error) {
      console.error('Error updating payment with report:', error);
      throw new Error(`Failed to update payment with report: ${error.message}`);
    }
  }

  createActivityReportProduct(data: Prisma.JobOrderReportProductCreateInput) {
    return this.prismaService.jobOrderReportProduct.create({
      data,
    });
  }

  createManyActivityReportProduct(
    data: Prisma.JobOrderReportProductCreateManyInput[],
  ) {
    return this.prismaService.jobOrderReportProduct.createMany({
      data,
    });
  }

  createActivityReportEdcEquipmentDongle(
    data: Prisma.JobOrderReportEdcEquipmentDongleCreateInput,
  ) {
    return this.prismaService.jobOrderReportEdcEquipmentDongle.create({
      data,
    });
  }

  createActivityReportMaterialPromo(
    data: Prisma.JobOrderReportMaterialPromoUncheckedCreateInput,
  ) {
    return this.prismaService.jobOrderReportMaterialPromo.create({
      data,
    });
  }

  createActivityReportMaterialTraining(
    data: Prisma.JobOrderReportMaterialTrainingUncheckedCreateInput,
  ) {
    return this.prismaService.jobOrderReportMaterialTraining.create({
      data,
    });
  }
}