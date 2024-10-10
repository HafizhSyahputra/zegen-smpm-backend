
// src/received-out/received-out.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReceivedOut, Prisma } from '@prisma/client';
import { CreateReceivedOutDto } from './dto/create-received-out.dto';
import { PageOptionReceivedOutDto } from './dto/page-option.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ColumnReceivedOut } from '../common/constants/enum';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { StatusReceivedOut } from '../common/constants/enum';

@Injectable()
export class ReceivedOutService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReceivedOutDto: CreateReceivedOutDto): Promise<ReceivedOut> {
    return this.prisma.receivedOut.create({
      data: createReceivedOutDto,
    });
  }

  async findAll(pageOptionReceivedOutDto: PageOptionReceivedOutDto): Promise<PageDto<ReceivedOut>> {
    const { skip, take, order, order_by, search, search_by } = pageOptionReceivedOutDto;

    const filter: Prisma.ReceivedOutWhereInput = {
      deleted_at: null,
    };
    const orderBy: Prisma.ReceivedOutOrderByWithRelationInput = {};

    if (search && search_by) {
      filter.OR = search_by.map((field: ColumnReceivedOut) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    if (order_by) {
      orderBy[order_by] = order;
    } else {
      orderBy[ColumnReceivedOut.id] = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.receivedOut.findMany({
        where: filter,
        skip,
        take,
        orderBy,
        include: {}, // Tidak memasukkan relasi
      }),
      this.prisma.receivedOut.count({ where: filter }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: pageOptionReceivedOutDto,
    });

    return new PageDto(items, pageMetaDto);
  }

  async findOne(id: number): Promise<ReceivedOut | null> {
    return this.prisma.receivedOut.findUnique({
      where: { id },
      include: {}, // Tidak memasukkan relasi
    });
  }

  async update(id: number, updateReceivedOutDto: CreateReceivedOutDto): Promise<ReceivedOut> {
    return this.prisma.receivedOut.update({
      where: { id },
      data: updateReceivedOutDto,
    });
  }

  async remove(id: number): Promise<ReceivedOut> {
    return this.prisma.receivedOut.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async bulkApprove(ids: number[]): Promise<Prisma.BatchPayload> {
    return this.prisma.receivedOut.updateMany({
      where: {
        id: {
          in: ids,
        },
        deleted_at: null,
      },
      data: {
        status: StatusReceivedOut.APPROVED,
      },
    });
  }

  async bulkReject(ids: number[]): Promise<Prisma.BatchPayload> {
    return this.prisma.receivedOut.updateMany({
      where: { id: { in: ids }, deleted_at: null },
      data: { status: StatusReceivedOut.REJECTED },
    });
  }

  async getReceivedOutStatistics(): Promise<{ waiting: number; approved: number; rejected: number }> {
    const stats = await this.prisma.receivedOut.groupBy({
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

  async getWaitingReceivedOuts(pageOptionReceivedOutDto: PageOptionReceivedOutDto): Promise<PageDto<ReceivedOut>> {
    return this.findAll({
      ...pageOptionReceivedOutDto,
      search: StatusReceivedOut.WAITING,
      search_by: [ColumnReceivedOut.status],
      skip: 0,
    });
  }
}
