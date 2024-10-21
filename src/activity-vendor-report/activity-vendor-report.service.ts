import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityVendorReport, Prisma } from '@prisma/client';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { PageOptionActivityVendorReportDto } from './dto/page-option.dto';
 
@Injectable()
export class ActivityVendorReportService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    pageOptionActivityVendorReportDto: PageOptionActivityVendorReportDto,
  ): Promise<PageDto<ActivityVendorReport>> {
    const { skip, take, order, order_by, search, search_by } =
      pageOptionActivityVendorReportDto;

    const filter: Prisma.ActivityVendorReportWhereInput = {
      deleted_at: null,
    };
    const orderBy: Prisma.ActivityVendorReportOrderByWithRelationInput = {};

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
      this.prisma.activityVendorReport.findMany({
        where: filter,
        skip,
        take,
        orderBy,
        include: {
            job_order: {
              include: {
                merchant: true,
                vendor: true,
              }
            },
           merchant: true,
           vendor: true,
           edc: true,
        },
      }),
      this.prisma.activityVendorReport.count({ where: filter }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: pageOptionActivityVendorReportDto,
    });

    return new PageDto(items, pageMetaDto);
  }

  async findOne(id: number): Promise<ActivityVendorReport | null> {
    return this.prisma.activityVendorReport.findUnique({
      where: { id, deleted_at: null },
      include: {
        job_order: {
          include: {
            merchant: true,
            vendor: true,
          }
        },
       merchant: true,
       vendor: true,
       edc: true,
      },
    });
  }
  
}
