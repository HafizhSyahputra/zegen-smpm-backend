import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Prisma, User, UserSession } from '@prisma/client';
import { AuthService } from '@smpm/auth/auth.service';
import { ColumnUser } from '@smpm/common/constants/enum';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { transformEntity } from '@smpm/common/transformer/entity.transformer';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PageOptionUserDto } from './dto/page-option-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const data = this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: await this.authService.hashData(createUserDto.password),
      },
      include: {
        role: true,
      },
    });

    return transformEntity(UserEntity, data);
  }

  async findAll(
    pageOptionUserDto: PageOptionUserDto,
  ): Promise<PageDto<UserEntity>> {
    const filter: Prisma.UserWhereInput = {};
    const order: Prisma.UserOrderByWithRelationInput = {};

    if (pageOptionUserDto.search && pageOptionUserDto.search_by)
      filter.OR = pageOptionUserDto.search_by.map((column) => ({
        [column]: {
          contains: pageOptionUserDto.search,
        },
      }));

    if (pageOptionUserDto.search && !pageOptionUserDto.search_by)
      filter.OR = Object.keys(ColumnUser)
        .filter((x) => x != ColumnUser.id)
        .map((column) => ({
          [column]: {
            contains: pageOptionUserDto.search,
          },
        }));

    pageOptionUserDto.order_by
      ? (order[pageOptionUserDto.order_by] = pageOptionUserDto.order)
      : (order.updated_at = pageOptionUserDto.order);

    const [data, countAll] = await Promise.all([
      this.prismaService.user.findMany({
        where: filter,
        orderBy: order,
        skip: pageOptionUserDto.skip,
        take: pageOptionUserDto.take,
        include: {
          role: true,
        },
      }),
      this.prismaService.user.count({
        where: {
          ...filter,
          deleted_at: null,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: countAll,
      pageOptionsDto: pageOptionUserDto,
    });
    console.log('Received search_by:', pageOptionUserDto.search_by);


    return new PageDto(transformEntity(UserEntity, data), pageMetaDto);
  }

  findOne(id: number): Promise<User> {
    const data = this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        role: true,
        region: true,
        vendor: true,
      },
    });

    return data;
  }

  findOneBy(where: Prisma.UserWhereInput): Promise<User> {
    return this.prismaService.user.findFirst({
      where,
      include: {
        role: true,
      },
    });
  }

  findByEmail(email: string): Promise<User> {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
      include: {
        role: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const password = updateUserDto.password
      ? {
          password: await this.authService.hashData(updateUserDto.password),
        }
      : {};
    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        ...updateUserDto,
        ...password,
      },
      include: {
        role: true,
      },
    });
  }

  async remove(id: number): Promise<null> {
    const find = await this.findOne(id);

    await this.prismaService.$transaction(async (trx) => {
      return await Promise.all([
        trx.user.update({
          where: {
            id,
          },
          data: {
            email: `${find.email} (deleted_at: ${Date.now()})`,
            npp: `${find.npp} (deleted_at: ${Date.now()})`,
          },
        }),
        trx.user.delete({
          where: {
            id,
          },
        }),
      ]);
    });

    return null;
  }

  findOneUserSessionBy(
    where: Prisma.UserSessionWhereInput,
  ): Promise<UserSession> {
    return this.prismaService.userSession.findFirst({
      where,
    });
  }

  async getAll(where: Prisma.UserWhereInput = {}): Promise<User[]> {
    return this.prismaService.user.findMany({
      where,
    });
  }
}
