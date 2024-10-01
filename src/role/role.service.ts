// role.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { ColumnRole } from '@smpm/common/constants/enum';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { PageOptionRoleDto } from './dto/page-option-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createRoleDto: CreateRoleDto): Promise<Role> {
    return this.prismaService.role.create({
      data: createRoleDto,
    });
  }

  async findAll(pageOptionRoleDto: PageOptionRoleDto): Promise<PageDto<Role>> {
    const filter: Prisma.RoleWhereInput = {};
    const order: Prisma.RoleOrderByWithRelationInput = {};

    if (pageOptionRoleDto.type) {
      filter.AND = pageOptionRoleDto.type.map((type) => ({
        type: type,
      }));
    }

    if (pageOptionRoleDto.search && pageOptionRoleDto.search_by) {
      filter.OR = pageOptionRoleDto.search_by.map((column) => ({
        [column]: {
          contains: pageOptionRoleDto.search,
          mode: 'insensitive', // Optional: Case-insensitive search
        },
      }));
    } else if (pageOptionRoleDto.search) {
      filter.OR = Object.values(ColumnRole) // Pastikan ColumnRole mencakup 'code'
        .filter((x) => x !== 'id')
        .map((column) => ({
          [column]: {
            contains: pageOptionRoleDto.search,
            mode: 'insensitive', // Optional: Case-insensitive search
          },
        }));
    }

    if (pageOptionRoleDto.order_by) {
      order[pageOptionRoleDto.order_by] = pageOptionRoleDto.order || 'asc';
    } else {
      order.updated_at = 'desc';
    }

    const [data, countAll] = await Promise.all([
      this.prismaService.role.findMany({
        where: filter,
        orderBy: order,
        skip: (pageOptionRoleDto.page - 1) * pageOptionRoleDto.take,
        take: pageOptionRoleDto.take,
      }),
      this.prismaService.role.count({
        where: {
          ...filter,
          deleted_at: null,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: countAll,
      pageOptionsDto: pageOptionRoleDto,
    });

    return new PageDto(data, pageMetaDto);
  }

  findOne(id: number): Promise<Role> {
    return this.prismaService.role.findUnique({
      where: {
        id,
      },
    });
  }

  findOneBy(where: Prisma.RoleWhereInput): Promise<Role> {
    return this.prismaService.role.findFirst({
      where,
    });
  }

  update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    return this.prismaService.role.update({
      where: {
        id,
      },
      data: updateRoleDto,
    });
  }

  async remove(id: number): Promise<null> {
    const role = await this.findOne(id);
    if (!role) {
      throw new BadRequestException('Data not found.');
    }

    await this.prismaService.$transaction(async (trx) => {
      await trx.role.update({
        where: { id },
        data: {
          name: `${role.name} (deleted_at: ${new Date().toISOString()})`,
          code: `${role.code} (deleted_at: ${new Date().toISOString()})`,
          deleted_at: new Date(),
        },
      });
      await trx.role.delete({
        where: { id },
      });
    });
    return null;
  }
}
