import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobOrderReport, Prisma } from '@prisma/client';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { PageOptionJOReportDto } from './dto/page-option.dto';

@Injectable()
export class JobOrderReportService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    pageOptionJOReportDto: PageOptionJOReportDto,
  ): Promise<PageDto<JobOrderReport>> {
    const { skip, take, order, order_by, search, search_by } =
      pageOptionJOReportDto;

    const filter: Prisma.JobOrderReportWhereInput = {
      deleted_at: null,
    };
    const orderBy: Prisma.JobOrderReportOrderByWithRelationInput = {};

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
      this.prisma.jobOrderReport.findMany({
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
      this.prisma.jobOrderReport.count({ where: filter }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: pageOptionJOReportDto,
    });

    return new PageDto(items, pageMetaDto);
  }

  async findOne(id: number): Promise<JobOrderReport | null> {
    return this.prisma.jobOrderReport.findUnique({
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
