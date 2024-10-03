
// src/lookup/lookup.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';;
import { PrismaService } from '../prisma/prisma.service';
import { LookUpEntity } from './entities/lookup.entity';
 import { PageOptionsDto } from '../common/decorator/page-options.dto';
import { PageMetaDto } from '../common/decorator/page-meta.dto';
import { PageDto } from '../common/decorator/page.dto';
import { PageMetaDtoParameters } from '../common/interfaces/pagination.interface';
import { Prisma } from '@prisma/client';
import { CreateLookUpDto } from './dto/create-lookup.dto';
import { UpdateLookUpDto } from './dto/update-lookup.dto';
import { GetLookUpOptionsDto } from './dto/get-lookup-options.dto';

@Injectable()
export class LookUpService {
  constructor(private prisma: PrismaService) {}

  async create(createLookUpDto: CreateLookUpDto): Promise<LookUpEntity> {
    try {
      return await this.prisma.lookUp.create({
        data: {
          name: createLookUpDto.name,
          category: createLookUpDto.category,
          created_by: createLookUpDto.created_by,
          updated_by: createLookUpDto.updated_by,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException(
            'There is a unique constraint violation',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      throw new HttpException(
        'Terjadi kesalahan saat membuat LookUp',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(
    getLookUpOptionsDto: GetLookUpOptionsDto,
  ): Promise<PageDto<LookUpEntity>> {
    try {
      let where: Prisma.LookUpWhereInput = { deleted_at: null };

      if (getLookUpOptionsDto.name) {
        where.name = { contains: getLookUpOptionsDto.name };
      }

      if (getLookUpOptionsDto.category) {
        where.category = { contains: getLookUpOptionsDto.category };
      }

      if (getLookUpOptionsDto.created_by) {
        where.created_by = getLookUpOptionsDto.created_by;
      }

      if (getLookUpOptionsDto.updated_by) {
        where.updated_by = getLookUpOptionsDto.updated_by;
      }

      if (getLookUpOptionsDto.search) {
        where.OR = [
          { name: { contains: getLookUpOptionsDto.search } },
          { category: { contains: getLookUpOptionsDto.search } },
        ];
      }

      const [items, itemCount] = await Promise.all([
        this.prisma.lookUp.findMany({
          where,
          skip: getLookUpOptionsDto.skip,
          take: getLookUpOptionsDto.take,
          orderBy: { id: getLookUpOptionsDto.order },
        }),
        this.prisma.lookUp.count({ where }),
      ]);

      const pageMetaDto = new PageMetaDto({
        pageOptionsDto: getLookUpOptionsDto,
        itemCount,
      });

      console.log('Page Meta:', pageMetaDto); // Debugging

      return new PageDto<LookUpEntity>(items, pageMetaDto);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Terjadi kesalahan saat mengambil LookUp',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: number): Promise<LookUpEntity> {
    try {
      const lookUp = await this.prisma.lookUp.findUnique({
        where: { id },
      });

      if (!lookUp) {
        throw new HttpException('LookUp tidak ditemukan', HttpStatus.NOT_FOUND);
      }

      return lookUp;
    } catch (error) {
      throw new HttpException(
        'Terjadi kesalahan saat mengambil LookUp',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: number, updateLookUpDto: UpdateLookUpDto): Promise<LookUpEntity> {
    try {
      const existingLookUp = await this.prisma.lookUp.findUnique({ where: { id } });
      if (!existingLookUp) {
        throw new HttpException('LookUp tidak ditemukan', HttpStatus.NOT_FOUND);
      }

      return await this.prisma.lookUp.update({
        where: { id },
        data: {
          name: updateLookUpDto.name,
          category: updateLookUpDto.category,
          created_by: updateLookUpDto.created_by,
          updated_by: updateLookUpDto.updated_by,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Terjadi kesalahan saat memperbarui LookUp',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: number): Promise<LookUpEntity> {
    try {
      const existingLookUp = await this.prisma.lookUp.findUnique({ where: { id } });
      if (!existingLookUp) {
        throw new HttpException('LookUp tidak ditemukan', HttpStatus.NOT_FOUND);
      }

      return await this.prisma.lookUp.delete({
        where: { id },
      });
    } catch (error) {
      throw new HttpException(
        'Terjadi kesalahan saat menghapus LookUp',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
   // **Metode Baru**: Mengambil LookUp berdasarkan kategori
   async findByCategory(category: string): Promise<LookUpEntity[]> {
    try {
      return await this.prisma.lookUp.findMany({
        where: {
          category: category,
          deleted_at: null, // Opsional: jika ingin mengabaikan LookUp yang dihapus
        },
        orderBy: {
          name: 'asc', // Sesuaikan dengan kebutuhan Anda
        },
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Terjadi kesalahan saat mengambil LookUp berdasarkan kategori',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
