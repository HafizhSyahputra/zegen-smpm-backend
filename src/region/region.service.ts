import { Injectable } from '@nestjs/common';
import { Prisma, Region } from '@prisma/client';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { PageOptionRegionDto } from './dto/page-option-region.dto';
import { ColumnRegion } from '@smpm/common/constants/enum';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Injectable()
export class RegionService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createRegionDto: CreateRegionDto): Promise<Region> {
    return this.prismaService.region.create({
      data: createRegionDto,
    });
  }

  async findAll(
    pageOptionRegionDto: PageOptionRegionDto,
  ): Promise<PageDto<Region>> {
    const filter: Prisma.RegionWhereInput = {};
    const order: Prisma.RegionOrderByWithRelationInput = {};

    if (pageOptionRegionDto.search && pageOptionRegionDto.search_by)
      filter.OR = pageOptionRegionDto.search_by.map((column) => ({
        [column]: {
          contains: pageOptionRegionDto.search,
        },
      }));

    if (pageOptionRegionDto.search && !pageOptionRegionDto.search_by)
      filter.OR = Object.keys(ColumnRegion)
        .filter((x) => x != ColumnRegion.id)
        .map((column) => ({
          [column]: {
            contains: pageOptionRegionDto.search,
          },
        }));

    pageOptionRegionDto.order_by
      ? (order[pageOptionRegionDto.order_by] = pageOptionRegionDto.order)
      : (order.updated_at = pageOptionRegionDto.order);

    const [data, countAll] = await Promise.all([
      this.prismaService.region.findMany({
        where: filter,
        orderBy: order,
        skip: pageOptionRegionDto.skip,
        take: pageOptionRegionDto.take,
      }),
      this.prismaService.region.count({
        where: {
          ...filter,
          deleted_at: null,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: countAll,
      pageOptionsDto: pageOptionRegionDto,
    });

    return new PageDto(data, pageMetaDto);
  }

  findOne(id: number): Promise<Region> {
    return this.prismaService.region.findUnique({
      where: {
        id,
      },
    });
  }

  findOneBy(where: Prisma.RegionWhereInput): Promise<Region> {
    return this.prismaService.region.findFirst({
      where,
    });
  }

  update(id: number, updateRegionDto: UpdateRegionDto): Promise<Region> {
    return this.prismaService.region.update({
      where: {
        id,
      },
      data: updateRegionDto,
    });
  }

  async remove(id: number): Promise<null> {
    this.prismaService.$transaction(async (trx) => {
      return await Promise.all([
        trx.region.update({
          where: {
            id,
          },
          data: {
            code: `${
              (await this.findOne(id)).code
            } (deleted_at: ${Date.now()})`,
          },
        }),
        trx.region.delete({
          where: {
            id,
          },
        }),
      ]);
    });
    return null;
  }

  async getAll(): Promise<Region[]> {
    return this.prismaService.region.findMany({});
  }
}
