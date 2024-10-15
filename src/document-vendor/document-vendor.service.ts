import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { DocumentVendor, Prisma } from '@prisma/client';
import { DocVendorEntity } from './entities/docVendor.entity';
import { UpdateDocVendorDto } from './dto/update-docVendor.dto';
import { ColumnDocVendor } from '@smpm/common/constants/enum';
import { PageOptionDocVendorDto } from './dto/page-option.dto';
import { CreateDocVendorDto } from './dto/create-docVendor.dto';

@Injectable()
export class DocumentVendorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(create: CreateDocVendorDto): Promise<DocumentVendor> {
    return this.prisma.documentVendor.create({
      data: create,
    });
  }

  async findAll(
    pageOptionDocVendorDto: PageOptionDocVendorDto,
  ): Promise<PageDto<DocumentVendor>> {
    const { skip, take, order, order_by, search, search_by } =
      pageOptionDocVendorDto;

    const filter: Prisma.DocumentVendorWhereInput = {
      deleted_at: null,
    };
    const orderBy: Prisma.DocumentVendorOrderByWithRelationInput = {};

    if (search && search_by) {
      filter.OR = search_by.map((field: ColumnDocVendor) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    if (order_by) {
      orderBy[order_by] = order;
    } else {
      orderBy[ColumnDocVendor.id] = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.documentVendor.findMany({
        where: filter,
        skip,
        take,
        orderBy,
        include: {
          vendor: true,
          jobOrder: true,
          region: true,
          merchant: true,
          edc: true,
        },
      }),
      this.prisma.documentVendor.count({ where: filter }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: pageOptionDocVendorDto,
    });

    return new PageDto(items, pageMetaDto);
  }

  async findOne(id: number): Promise<DocumentVendor | null> {
    return this.prisma.documentVendor.findUnique({
      where: { id, deleted_at: null },
      include: {
        vendor: true,
        jobOrder: true,
        region: true,
        merchant: true,
        edc: true,
      },
    });
  }

  async remove(id: number): Promise<DocumentVendor> {
    return this.prisma.documentVendor.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async deleteFile(id: number, fileKey: 'file1' | 'file2'): Promise<void> {
    const docVendor = await this.findOne(id);
    if (!docVendor) {
      throw new BadRequestException('Data not found.');
    }

    const filePath = docVendor[fileKey];
    if (!filePath) {
      throw new BadRequestException(`No file found for ${fileKey}.`);
    }

    try {
      await this.prisma.documentVendor.update({
        where: { id },
        data: {
          [fileKey]: null,
        },
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new BadRequestException('Error deleting file.');
    }
  }

  async update(
    id: number,
    updateDocVendorDto: UpdateDocVendorDto,
  ): Promise<DocVendorEntity> {
    const updatedDocument = await this.prisma.documentVendor.update({
      where: { id },
      data: {
        ...updateDocVendorDto,
        updated_at: new Date(),
      },
    });
    return new DocVendorEntity(updatedDocument);
  }
}
