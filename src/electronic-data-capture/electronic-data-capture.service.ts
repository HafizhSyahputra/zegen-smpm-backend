import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { CreateElectronicDataCaptureDto } from './dto/create-electronic-data-capture.dto';
import { UpdateElectronicDataCaptureDto } from './dto/update-electronic-data-capture.dto';
import { ElectronicDataCapture } from './entities/electronic-data-capture.entity';
import { EdcBrandType, ElectronicDataCaptureMachine } from '@prisma/client';
import { GetEdcBrandTypeDto } from './dto/get-edc-brand-type.dto';

@Injectable()
export class ElectronicDataCaptureService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<ElectronicDataCapture[]> {
    return this.prisma.electronicDataCaptureMachine.findMany({});
  }


  async create(
    createElectronicDataCaptureDto: CreateElectronicDataCaptureDto,
  ): Promise<ElectronicDataCapture> {
    try {
      return await this.prisma.electronicDataCaptureMachine.create({
        data: {
          mid: createElectronicDataCaptureDto.mid,
          tid: createElectronicDataCaptureDto.tid,
          brand: createElectronicDataCaptureDto.brand,
          brand_type: createElectronicDataCaptureDto.brand_type,
          serial_number: createElectronicDataCaptureDto.serial_number,
          status_owner: createElectronicDataCaptureDto.status_owner,
          status_owner_desc: createElectronicDataCaptureDto.status_owner_desc,
          status_machine: createElectronicDataCaptureDto.status_machine,
          status_machine_desc:
            createElectronicDataCaptureDto.status_machine_desc,
          status_active: createElectronicDataCaptureDto.status_active,
          simcard_provider: createElectronicDataCaptureDto.simcard_provider,
          region: createElectronicDataCaptureDto.region,
          simcard_number: createElectronicDataCaptureDto.simcard_number,
          info: createElectronicDataCaptureDto.info,
          owner_id: 1,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(pageOptionUserDto: PageOptionsDto) {
    const [data, countAll] = await Promise.all([
      this.prisma.electronicDataCaptureMachine.findMany({
        // where: filter,
        // orderBy: order,
        skip: pageOptionUserDto.skip,
        take: pageOptionUserDto.take,
      }),
      this.prisma.electronicDataCaptureMachine.count({
        where: {
          deleted_at: null,
        },
      }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: countAll,
      pageOptionsDto: pageOptionUserDto,
    });

    return new PageDto(data, pageMetaDto);
  }

  findOne(id: number) {
    return `This action returns a #${id} electronicDataCapture`;
  }

  async findEDCMachineBySerialNumber(serial_number: string): Promise<ElectronicDataCaptureMachine | null> {
    return this.prisma.electronicDataCaptureMachine.findFirst({
      where: {
        serial_number: serial_number.toUpperCase(),
        deleted_at: null,
      },
    });
  }

  update(
    id: number,
    updateElectronicDataCaptureDto: UpdateElectronicDataCaptureDto,
  ) {
    return `This action updates a #${id} electronicDataCapture`;
  }

  remove(id: number) {
    return `This action removes a #${id} electronicDataCapture`;
  }

  getBrand(): Promise<EdcBrandType[]> {
    return this.prisma.edcBrandType.findMany({
      distinct: 'brand',
    });
  }

  getBrandType(
    getEdcBrandTypeDto: GetEdcBrandTypeDto,
  ): Promise<EdcBrandType[]> {
    return this.prisma.edcBrandType.findMany({
      where: {
        ...getEdcBrandTypeDto,
      },
      distinct: 'type',
    });
  }
}