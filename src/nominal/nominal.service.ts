import { BadRequestException, Injectable } from '@nestjs/common';
import { NominalJobOrder, Prisma } from '@prisma/client';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { UpdateNominalDto } from './dto/update-nominal.dto';
import { CreateNominalDto } from './dto/create-nominal.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { PageOptionNominalDto } from './dto/page-option.dto';
import { ColumnNominal } from '@smpm/common/constants/enum';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';

@Injectable()
export class NominalService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    pageOptionNominalDto: PageOptionNominalDto,
  ): Promise<PageDto<NominalJobOrder>> {
    const { skip, take, order, order_by, search, search_by } =
      pageOptionNominalDto;

    const filter: Prisma.NominalJobOrderWhereInput = {
      deleted_at: null,
    };
    const orderBy: Prisma.NominalJobOrderOrderByWithRelationInput = {};

    if (search && search_by) {
      filter.OR = search_by.map((field: ColumnNominal) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    if (order_by) {
      orderBy[order_by] = order;
    } else {
      orderBy[ColumnNominal.id] = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.nominalJobOrder.findMany({
        where: filter,
        include: {
          vendor: true,
        },
        skip,
        take,
        orderBy,
      }),
      this.prisma.nominalJobOrder.count({ where: filter }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: pageOptionNominalDto,
    });

    return new PageDto(items, pageMetaDto);
  }

  async getAll(): Promise<NominalJobOrder[]> {
    return this.prisma.nominalJobOrder.findMany({});
  }

  async create(  
    createNominalDto: CreateNominalDto,  
    createdBy?: number,  
  ): Promise<NominalJobOrder> {  
    const existingCombination = await this.findByVendorAndJenis(  
      createNominalDto.vendor_id,  
      createNominalDto.jenis,  
    );  

    if (existingCombination) {  
      throw new BadRequestException(  
        'Kombinasi Vendor dan Jenis Job Order sudah ada. Silakan gunakan kombinasi yang berbeda.',  
      );  
    }  

    return this.prisma.nominalJobOrder.create({  
      data: {  
        ...createNominalDto,  
        created_by: createdBy,  
        updated_by: createdBy,  
      },  
    });  
  }  

  findOne(id: number): Promise<NominalJobOrder> {
    return this.prisma.nominalJobOrder.findUnique({
      where: {
        id,
      },
      include: {
        vendor: true,
      },
    });
  }

  async update(  
    id: number,  
    updateNominalDto: UpdateNominalDto,  
    updatedBy: number,  
  ): Promise<NominalJobOrder> {  
    const currentData = await this.findOne(id);  
    
    if (updateNominalDto.vendor_id || updateNominalDto.jenis) {  
      const existingCombination = await this.findByVendorAndJenis(  
        updateNominalDto.vendor_id || currentData.vendor_id,  
        updateNominalDto.jenis || currentData.jenis,  
        id,  
      );  

      if (existingCombination) {  
        throw new BadRequestException(  
          'Kombinasi Vendor dan Jenis Job Order sudah ada. Silakan gunakan kombinasi yang berbeda.',  
        );  
      }  
    }  

    return this.prisma.nominalJobOrder.update({  
      where: {  
        id,  
      },  
      data: {  
        ...updateNominalDto,  
        updated_by: updatedBy,  
        updated_at: new Date(),  
      },  
    });  
  }  

  async remove(id: number): Promise<null> {
    this.prisma.$transaction(async (trx) => {
      return await Promise.all([
        trx.nominalJobOrder.delete({
          where: {
            id,
          },
        }),
      ]);
    });
    return null;
  }

  async findByVendorAndJenis(  
    vendor_id: number,  
    jenis: string,  
    excludeId?: number,  
  ): Promise<NominalJobOrder | null> {  
    return this.prisma.nominalJobOrder.findFirst({  
      where: {  
        vendor_id: vendor_id,  
        jenis: jenis,  
        deleted_at: null,  
        ...(excludeId && { NOT: { id: excludeId } }),  
      },  
    });  
  }  
}
