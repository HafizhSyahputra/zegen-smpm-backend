import { BadRequestException, Injectable } from '@nestjs/common';
import { JobOrder, Prisma, StagingJobOrder } from '@prisma/client';
import { ColumnJobOrder, JobOrderStatus } from '@smpm/common/constants/enum';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { transformEntity } from '@smpm/common/transformer/entity.transformer';
import { convertStringToObjectContains } from '@smpm/common/utils/string';
import { AcknowledgeDto } from '@smpm/electronic-data-capture/dto/acknowledge.dto';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { PageOptionJobOrderDto } from './dto/page-option-job-order.dto';
import { JobOrderEntity } from './entities/job-order.entity';

@Injectable()
export class JobOrderService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async createMany(data: Prisma.JobOrderUncheckedCreateInput[]) {  
    try {  
      return await this.prismaService.jobOrder.createMany({  
        data,  
      });  
    } catch (error) {  
      console.error('Error saat menyimpan job orders:', error);  
      throw new BadRequestException('Gagal menyimpan job orders');  
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
  createActivityReport(
    data: Prisma.JobOrderReportUncheckedCreateInput,
    mediaEvidence?: { media_id: number }[],
    mediaOptional?: { media_id: number }[],
  ) {
    return this.prismaService.jobOrderReport.create({
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
  }
  createPreventiveMaintenanceReport(
    data: Prisma.PreventiveMaintenanceReportUncheckedCreateInput,
    mediaEvidence?: { media_id: number }[],
    mediaOptional?: { media_id: number }[],
  ) {
    return this.prismaService.preventiveMaintenanceReport.create({
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