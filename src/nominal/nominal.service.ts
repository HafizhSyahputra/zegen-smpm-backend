import { Injectable } from '@nestjs/common';
import { NominalJobOrder } from '@prisma/client';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { UpdateNominalDto } from './dto/update-nominal.dto';
import { CreateNominalDto } from './dto/create-nominal.dto';

@Injectable()
export class NominalService {
  constructor(private readonly prisma: PrismaService) {}


  create(createNominalDto: CreateNominalDto): Promise<NominalJobOrder> {
    return this.prisma.nominalJobOrder.create({
      data: createNominalDto,
    });
  }

  findOne(id: number): Promise<NominalJobOrder> {
    return this.prisma.nominalJobOrder.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: number, updateNominalDto: UpdateNominalDto): Promise<NominalJobOrder> {
    return this.prisma.nominalJobOrder.update({
      where: {
        id,
      },
      data: updateNominalDto,
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
}
