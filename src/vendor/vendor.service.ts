import { Injectable } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { Prisma, Vendor } from '@prisma/client';
import { PageOptionVendorDto } from './dto/page-options-vendor.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ColumnVendor } from '@smpm/common/constants/enum';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';

@Injectable()
export class VendorService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    return this.prismaService.vendor.create({
      data: createVendorDto,
    });
  }

  async findAll(
    pageOptionVendorDto: PageOptionVendorDto,
  ): Promise<PageDto<Vendor>> {
    const filter: Prisma.VendorWhereInput = {};
    const order: Prisma.VendorOrderByWithRelationInput = {};

    if (pageOptionVendorDto.search && pageOptionVendorDto.search_by)
      filter.OR = pageOptionVendorDto.search_by.map((column) => ({
        [column]: {
          contains: pageOptionVendorDto.search,
        },
      }));

    if (pageOptionVendorDto.search && !pageOptionVendorDto.search_by)
      filter.OR = Object.keys(ColumnVendor)
        .filter((x) => x != ColumnVendor.id)
        .map((column) => ({
          [column]: {
            contains: pageOptionVendorDto.search,
          },
        }));

    pageOptionVendorDto.order_by
      ? (order[pageOptionVendorDto.order_by] = pageOptionVendorDto.order)
      : (order.updated_at = pageOptionVendorDto.order);

    const [data, countAll] = await Promise.all([
      this.prismaService.vendor.findMany({
        where: filter,
        orderBy: order,
        skip: pageOptionVendorDto.skip,
        take: pageOptionVendorDto.take,
      }),
      this.prismaService.vendor.count({
        where: {
          ...filter,
          deleted_at: null,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: countAll,
      pageOptionsDto: pageOptionVendorDto,
    });

    return new PageDto(data, pageMetaDto);
  }

  findOne(id: number): Promise<Vendor> {
    return this.prismaService.vendor.findUnique({
      where: {
        id,
      },
    });
  }

  findOneBy(where: Prisma.VendorWhereInput): Promise<Vendor> {
    return this.prismaService.vendor.findFirst({
      where,
    });
  }

  update(id: number, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    return this.prismaService.vendor.update({
      where: {
        id,
      },
      data: updateVendorDto,
    });
  }

  async remove(id: number): Promise<null> {
    this.prismaService.$transaction(async (trx) => {
      return await Promise.all([
        trx.vendor.update({
          where: {
            id,
          },
          data: {
            code: `${
              (await this.findOne(id)).code
            } (deleted_at: ${Date.now()})`,
          },
        }),
        trx.vendor.delete({
          where: {
            id,
          },
        }),
      ]);
    });
    return null;
  }

  async getAll(): Promise<Vendor[]> {
    return this.prismaService.vendor.findMany({});
  }
}
