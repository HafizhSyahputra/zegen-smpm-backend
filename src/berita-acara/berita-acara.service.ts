import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { Prisma, BeritaAcara } from '@prisma/client';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { ColumnBeritaAcara } from '@smpm/common/constants/enum';
import * as fs from 'fs';
import * as path from 'path';
import { CreateBeritaAcaraDto } from './dto/create-berita-acara.dto';
import { PageOptionBeritaAcaraDto } from './dto/page-options-berita-acara.dto';

@Injectable()
export class BeritaAcaraService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createBeritaAcaraDto: CreateBeritaAcaraDto): Promise<BeritaAcara> {
    return this.prismaService.beritaAcara.create({
      data: {
        ...createBeritaAcaraDto,
        status: 'Open',
      },
    });
  }

  async findAll(
    pageOptionBeritaAcaraDto: PageOptionBeritaAcaraDto,
  ): Promise<PageDto<BeritaAcara>> {
    const filter: Prisma.BeritaAcaraWhereInput = {};
    const order: Prisma.BeritaAcaraOrderByWithRelationInput = {};

    // Handle search filter
    if (pageOptionBeritaAcaraDto.search && pageOptionBeritaAcaraDto.search_by) {
      filter.OR = pageOptionBeritaAcaraDto.search_by.map((column) => ({
        [column]: {
          contains: pageOptionBeritaAcaraDto.search,
        },
      }));
    }

    if (pageOptionBeritaAcaraDto.search && !pageOptionBeritaAcaraDto.search_by) {
      filter.OR = Object.keys(ColumnBeritaAcara)
        .filter((x) => x !== ColumnBeritaAcara.id_berita_acara)
        .map((column) => ({
          [column]: {
            contains: pageOptionBeritaAcaraDto.search,
          },
        }));
    }

    // Handle order
    pageOptionBeritaAcaraDto.order_by
      ? (order[pageOptionBeritaAcaraDto.order_by] = pageOptionBeritaAcaraDto.order)
      : (order.updated_at = pageOptionBeritaAcaraDto.order);

    const [data, countAll] = await Promise.all([
      this.prismaService.beritaAcara.findMany({
        where: filter,
        orderBy: order,
        skip: pageOptionBeritaAcaraDto.skip,
        take: pageOptionBeritaAcaraDto.take,
      }),
      this.prismaService.beritaAcara.count({
        where: {
          ...filter,
          deleted_at: null,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: countAll,
      pageOptionsDto: pageOptionBeritaAcaraDto,
    });

    return new PageDto(data, pageMetaDto);
  }

  async findOne(id: number): Promise<BeritaAcara> {
    const beritaAcara = await this.prismaService.beritaAcara.findUnique({
      where: { id_berita_acara: id },
    });

    if (!beritaAcara) {
      throw new NotFoundException(`Berita Acara with ID ${id} not found`);
    }

    return beritaAcara;
  }

  async submitFile(id: number, file: Express.Multer.File): Promise<BeritaAcara> {
    const beritaAcara = await this.findOne(id);
    
    // Delete old file if exists
    if (beritaAcara.path_file && fs.existsSync(beritaAcara.path_file)) {
      fs.unlinkSync(beritaAcara.path_file);
    }

    return this.prismaService.beritaAcara.update({
      where: { id_berita_acara: id },
      data: {
        path_file: file.path,
        tgl_submit: new Date(),
        status: 'Submitted',
      },
    });
  }

  async updateNote(id: number, note: string): Promise<BeritaAcara> {
    await this.findOne(id);

    return this.prismaService.beritaAcara.update({
      where: { id_berita_acara: id },
      data: { note },
    });
  }

  async updateFile(id: number, file: Express.Multer.File): Promise<BeritaAcara> {
    const beritaAcara = await this.findOne(id);

    // Delete old file if exists
    if (beritaAcara.path_file && fs.existsSync(beritaAcara.path_file)) {
      fs.unlinkSync(beritaAcara.path_file);
    }

    return this.prismaService.beritaAcara.update({
      where: { id_berita_acara: id },
      data: {
        path_file: file.path,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: number): Promise<BeritaAcara> {
    const beritaAcara = await this.findOne(id);

    // Delete file if exists
    if (beritaAcara.path_file && fs.existsSync(beritaAcara.path_file)) {
      fs.unlinkSync(beritaAcara.path_file);
    }

    return this.prismaService.beritaAcara.delete({
      where: { id_berita_acara: id },
    });
  }
}