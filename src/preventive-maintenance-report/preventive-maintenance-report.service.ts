import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PreventiveMaintenanceReport, Prisma } from '@prisma/client';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { PageOptionPMReportDto } from './dto/page-option.dto';
 
@Injectable()
export class PreventiveMaintenanceReportService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    pageOptionPMReportDto: PageOptionPMReportDto,
  ): Promise<PageDto<PreventiveMaintenanceReport>> {
    const { skip, take, order, order_by, search, search_by } =
      pageOptionPMReportDto;

    const filter: Prisma.PreventiveMaintenanceReportWhereInput = {
      deleted_at: null,
    };
    const orderBy: Prisma.PreventiveMaintenanceReportOrderByWithRelationInput = {};

    if (search && search_by) {
      filter.OR = search_by.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    if (order_by) {
      orderBy[order_by] = order;
    } else {
      orderBy.id = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.preventiveMaintenanceReport.findMany({
        where: filter,
        skip,
        take,
        orderBy,
        include: {
          job_order: true,
          MediaJobOrderReportProofOfVisit: true,
          MediaJobOrderReportOptionalPhoto: true,
          JobOrderReportEdcEquipmentDongle: true,
          JobOrderReportMaterialPromo: true,
          JobOrderReportProduct: true,
          JobOrderReportMaterialTraining: true,
        },
      }),
      this.prisma.preventiveMaintenanceReport.count({ where: filter }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: pageOptionPMReportDto,
    });

    return new PageDto(items, pageMetaDto);
  }

  async findOne(id: number): Promise<PreventiveMaintenanceReport | null> {
    return this.prisma.preventiveMaintenanceReport.findUnique({
      where: { id, deleted_at: null },
      include: {
        job_order: true,
        MediaJobOrderReportProofOfVisit: true,
        MediaJobOrderReportOptionalPhoto: true,
        JobOrderReportEdcEquipmentDongle: true,
        JobOrderReportMaterialPromo: true,
        JobOrderReportProduct: true,
        JobOrderReportMaterialTraining: true,
      },
    });
  }
  
}
