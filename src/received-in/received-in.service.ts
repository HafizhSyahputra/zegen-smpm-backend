import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { ReceivedIn, Prisma, EDCTerpasang } from '@prisma/client';
import { CreateReceivedInDto } from './dto/create-received-in.dto';
import { PageOptionReceivedInDto } from './dto/page-option.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ColumnReceivedIn } from '@smpm/common/constants/enum';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { ApproveReceivedInDto } from './dto/approve-received-in.dto';

@Injectable()
export class ReceivedInService {
  private readonly logger = new Logger(ReceivedInService.name); // Inisialisasi Logger
  constructor(private readonly prisma: PrismaService) {}

  async create(createReceivedInDto: CreateReceivedInDto): Promise<ReceivedIn> {
    this.logger.log(`Membuat ReceivedIn dengan data: ${JSON.stringify(createReceivedInDto)}`);
    const data: Prisma.ReceivedInCreateInput = {
      joborder: { connect: { id: createReceivedInDto.id_joborder } },
      edc: { connect: { id: createReceivedInDto.id_edc } },
      region: { connect: { id: createReceivedInDto.id_region } },
      vendor: { connect: { id: createReceivedInDto.id_vendor } },
      merchant: { connect: { id: createReceivedInDto.id_merchant } },
      serial_number: createReceivedInDto.serial_number,
      tid: createReceivedInDto.tid,
      // Tambahkan field lain jika diperlukan
    };

    try {
      const receivedIn = await this.prisma.receivedIn.create({
        data,
      });
      this.logger.log(`ReceivedIn berhasil dibuat: ${JSON.stringify(receivedIn)}`);
      return receivedIn;
    } catch (error) {
      this.logger.error('Gagal membuat ReceivedIn', error);
      throw new BadRequestException('Gagal membuat ReceivedIn', error.message);
    }
  }

  async findAll(pageOptionReceivedInDto: PageOptionReceivedInDto): Promise<PageDto<ReceivedIn>> {
    const { skip, take, order, order_by, search, search_by, status } = pageOptionReceivedInDto;

    const filter: Prisma.ReceivedInWhereInput = {
      deleted_at: null,
    };

    // Tambahkan filter status jika diberikan
    if (status) {
      filter.status = status;
    }

    const orderBy: Prisma.ReceivedInOrderByWithRelationInput = {};

    if (search && search_by) {
      filter.OR = search_by.map((field: ColumnReceivedIn) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    if (order_by) {
      orderBy[order_by] = order;
    } else {
      orderBy[ColumnReceivedIn.id] = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.receivedIn.findMany({
        where: filter,
        skip,
        take,
        orderBy,
        include: {
          joborder: true,
          edc: true,
          region: true,
          vendor: true,
          merchant: true,
        },
      }),
      this.prisma.receivedIn.count({ where: filter }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: pageOptionReceivedInDto,
    });

    return new PageDto(items, pageMetaDto);
  }

  async findOne(id: number): Promise<ReceivedIn | null> {
    return this.prisma.receivedIn.findUnique({
      where: { id },
      include: {
        joborder: true,
        edc: true,
        region: true,
        vendor: true,
        merchant: true,
      },
    });
  }

  async approve(id: number, approveReceivedInDto: ApproveReceivedInDto): Promise<ReceivedIn> {
    return this.prisma.receivedIn.update({
      where: { id },
      data: {
        petugas: approveReceivedInDto.petugas,
        status: 'approved',
        approved_by: approveReceivedInDto.approved_by,
        updated_by: approveReceivedInDto.updated_by,
      },
    });
  }
  

  // Definisi metode remove
  async remove(id: number): Promise<ReceivedIn> {
    return this.prisma.receivedIn.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findEDCTerpasangBySerialNumber(serial_number: string): Promise<EDCTerpasang | null> {
    this.logger.log(`Mencari EDCTerpasang dengan serial_number: ${serial_number}`);
    const edc = await this.prisma.eDCTerpasang.findFirst({
      where: { serial_number: serial_number.toUpperCase(), deleted_at: null },
    });
    if (edc) {
      this.logger.log(`EDCTerpasang ditemukan: ${JSON.stringify(edc)}`);
    } else {
      this.logger.warn(`EDCTerpasang tidak ditemukan untuk serial_number: ${serial_number}`);
    }
    return edc;
  }

}