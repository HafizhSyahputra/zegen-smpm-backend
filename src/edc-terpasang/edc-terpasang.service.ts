// src/edc-terpasang/edc-terpasang.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEDCTerpasangDto } from './dto/create-edc-terpasang.dto';
import { UpdateEDCTerpasangDto } from './dto/update-edc-terpasang.dto';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { Prisma, EDCTerpasang } from '@prisma/client';
import { PageOptionEDCTerpasangDto } from './dto/page-option-edc-terpasang.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ColumnEDCTerpasang } from '@smpm/common/constants/enum';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';

@Injectable()
export class EDCTerpasangService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createEDCTerpasangDto: CreateEDCTerpasangDto): Promise<EDCTerpasang> {
    // Standardisasi serial_number menjadi huruf besar
    createEDCTerpasangDto.serial_number = createEDCTerpasangDto.serial_number.toUpperCase();
    return this.prismaService.eDCTerpasang.create({
      data: createEDCTerpasangDto,
    });
  }

  async findEDCTerpasangBySerialNumber(serial_number: string): Promise<EDCTerpasang | null> {
    return this.prismaService.eDCTerpasang.findFirst({
      where: {
        serial_number: serial_number.toUpperCase(),
        deleted_at: null,
      },
    });
  }

  async findAll(
    pageOptionEDCTerpasangDto: PageOptionEDCTerpasangDto,
  ): Promise<PageDto<EDCTerpasang>> {
    const filter: Prisma.EDCTerpasangWhereInput = {
      deleted_at: null, // Mengacu pada entri aktif
    };
    const order: Prisma.EDCTerpasangOrderByWithRelationInput = {};

    if (
      pageOptionEDCTerpasangDto.search &&
      pageOptionEDCTerpasangDto.search_by
    )
      filter.OR = pageOptionEDCTerpasangDto.search_by.map((column) => ({
        [column]: {
          contains: pageOptionEDCTerpasangDto.search.toUpperCase(), // Pastikan konsistensi kasus
          mode: 'insensitive', // Tambahkan mode jika didukung
        },
      }));

    if (
      pageOptionEDCTerpasangDto.search &&
      !pageOptionEDCTerpasangDto.search_by
    )
      filter.OR = Object.keys(ColumnEDCTerpasang)
        .filter((x) => x !== ColumnEDCTerpasang.id)
        .map((column) => ({
          [column]: {
            contains: pageOptionEDCTerpasangDto.search.toUpperCase(),
            mode: 'insensitive', // Tambahkan mode jika didukung
          },
        }));

    if (pageOptionEDCTerpasangDto.order_by) {
      order[pageOptionEDCTerpasangDto.order_by] =
        pageOptionEDCTerpasangDto.order;
    } else {
      order.updated_at = pageOptionEDCTerpasangDto.order;
    }

    const [data, countAll] = await Promise.all([
      this.prismaService.eDCTerpasang.findMany({
        where: filter,
        orderBy: order,
        skip: pageOptionEDCTerpasangDto.skip,
        take: pageOptionEDCTerpasangDto.take,
      }),
      this.prismaService.eDCTerpasang.count({
        where: {
          ...filter,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: countAll,
      pageOptionsDto: pageOptionEDCTerpasangDto,
    });

    return new PageDto(data, pageMetaDto);
  }

  findOne(id: number): Promise<EDCTerpasang> {
    return this.prismaService.eDCTerpasang.findUnique({
      where: {
        id,
      },
    });
  }

  findOneBy(where: Prisma.EDCTerpasangWhereInput): Promise<EDCTerpasang> {
    return this.prismaService.eDCTerpasang.findFirst({
      where,
    });
  }

  async update(
    id: number,
    updateEDCTerpasangDto: UpdateEDCTerpasangDto,
  ): Promise<EDCTerpasang> {
    if (updateEDCTerpasangDto.serial_number) {
      updateEDCTerpasangDto.serial_number = updateEDCTerpasangDto.serial_number.toUpperCase();
    }
    return this.prismaService.eDCTerpasang.update({
      where: {
        id,
      },
      data: updateEDCTerpasangDto,
    });
  }

  async remove(id: number): Promise<null> {
    await this.prismaService.$transaction(async (trx) => {
      const existing = await trx.eDCTerpasang.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new BadRequestException('Data tidak ditemukan.');
      }

      await Promise.all([
        trx.eDCTerpasang.update({
          where: { id },
          data: {
            simcard_number: `${existing.simcard_number} (deleted_at: ${new Date().toISOString()})`,
          },
        }),
        trx.eDCTerpasang.delete({
          where: { id },
        }),
      ]);
    });
    return null;
  }

  async getAll(): Promise<EDCTerpasang[]> {
    return this.prismaService.eDCTerpasang.findMany({
      where: { deleted_at: null }, // Pastikan hanya data aktif
    });
  }
}