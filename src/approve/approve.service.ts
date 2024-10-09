
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Approved, Prisma } from '@prisma/client';
import { CreateApproveDto } from './dto/create-approve.dto';
import { PageOptionApproveDto } from './dto/page-option.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ColumnApproved } from '@smpm/common/constants/enum';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { UpdateApprovedDto } from './dto/update-approve.dto';

@Injectable()
export class ApproveService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createApproveDto: CreateApproveDto): Promise<Approved> {
    return this.prisma.approved.create({
      data: createApproveDto,
    });
  }

  async findAll(pageOptionApproveDto: PageOptionApproveDto): Promise<PageDto<Approved>> {
    const { skip, take, order, order_by, search, search_by } = pageOptionApproveDto;

    const filter: Prisma.ApprovedWhereInput = {
      deleted_at: null, 
    };
    const orderBy: Prisma.ApprovedOrderByWithRelationInput = {};

    if (search && search_by) {
      filter.OR = search_by.map((field: ColumnApproved) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    if (order_by) {
      orderBy[order_by] = order;
    } else {
      orderBy[ColumnApproved.id] = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.approved.findMany({
        where: filter,
        skip,
        take,
        orderBy,
        include: {
          jobOrder: true,
          vendor: true,
          region: true,
        },
      }),
      this.prisma.approved.count({ where: filter }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: pageOptionApproveDto,
    });

    return new PageDto(items, pageMetaDto);
  }

  async findOne(id: number): Promise<Approved | null> {
    return this.prisma.approved.findUnique({
      where: { id, deleted_at: null },
      include: {
        jobOrder: true,
        vendor: true,
        region: true,
      },
    });
  }

  async findManyByIds(ids: number[]): Promise<Approved[]> {  
    return this.prisma.approved.findMany({  
      where: {  
        id: { in: ids },  
      },  
    });  
  }

  async update(id: number, updateApproveDto: UpdateApprovedDto): Promise<Approved> {
    return this.prisma.approved.update({
      where: { id },
      data: updateApproveDto,
    });
  }

  async remove(id: number): Promise<Approved> {
    return this.prisma.approved.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async approveItem(id: number, userId: number): Promise<Approved> {  
    return this.prisma.approved.update({  
      where: { id },  
      data: {   
        status: 'Approved',  
        approved_by: userId,   
        updated_by: userId,  
      },  
    });  
  }

  async rejectItem(id: number, reason: string, info_remark: string, userId: number): Promise<Approved> {  
    return this.prisma.approved.update({  
      where: { id },  
      data: {  
        status: 'Rejected',  
        reason,  
        info_remark,  
        rejected_by: userId,  
        approved_by: null,    
        updated_by: userId,  
      },  
    });  
  }

  async bulkApprove(ids: number[], userId: number): Promise<Prisma.BatchPayload> {  
    return this.prisma.approved.updateMany({  
      where: {  
        id: {  
          in: ids  
        },  
        deleted_at: null  
      },  
      data: {  
        status: 'Approved',  
        approved_by: userId,  
        updated_by: userId  
      }  
    });  
  }
  
  async bulkReject(ids: number[]): Promise<Prisma.BatchPayload> {
    return this.prisma.approved.updateMany({
      where: { id: { in: ids } },
      data: { status: 'Rejected' },
    });
  }

  async getApprovalStatistics(): Promise<{ waiting: number; approved: number; rejected: number }> {
    const stats = await this.prisma.approved.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      where: {
        deleted_at: null,
      },
    });

    return stats.reduce((acc, curr) => {
      acc[curr.status.toLowerCase() as 'waiting' | 'approved' | 'rejected'] = curr._count.status;
      return acc;
    }, { waiting: 0, approved: 0, rejected: 0 });
  }

  async getWaitingApprovals(pageOptionApproveDto: PageOptionApproveDto): Promise<PageDto<Approved>> {
    return this.findAll({
      ...pageOptionApproveDto,
      search: 'Waiting',
      search_by: [ColumnApproved.status],
      skip: 0,
    });
  }
}
