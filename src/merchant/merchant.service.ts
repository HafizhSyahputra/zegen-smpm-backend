import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { MerchantEntity } from './entities/merchant.entity';
import { GetMerchantQuery } from './dto/get-merchant.dto';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import * as path from 'path';
import XLSX, { readFile, utils } from 'xlsx';
import { deleteFile } from '@smpm/utils/FileDelete';
import { Merchant, Prisma } from '@prisma/client';

@Injectable()
export class MerchantService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Merchant[]> {
    return this.prisma.merchant.findMany({});
  }
  async create(createMerchantDto: CreateMerchantDto): Promise<any> {  
    try {  
      return await this.prisma.merchant.create({  
        data: {  
          region_id: createMerchantDto.region_id,  
          mid: createMerchantDto.mid,  
          name: createMerchantDto.name,  
          category: createMerchantDto.category,  
          customer_name: createMerchantDto.customer_name,  
          telephone: createMerchantDto.telephone,  
          pic: createMerchantDto.pic,  
          phone1: createMerchantDto.phone1,  
          phone2: createMerchantDto.phone2,  
          address1: createMerchantDto.address1,  
          address2: createMerchantDto.address2,  
          address3: createMerchantDto.address3,  
          address4: createMerchantDto.address4,  
          district: createMerchantDto.district,  
          subdistrict: createMerchantDto.subdistrict,  
          city: createMerchantDto.city,  
          province: createMerchantDto.province,  
          postal_code: createMerchantDto.postal_code,
          status: createMerchantDto.status,  
          created_by: createMerchantDto.created_by,  
          updated_by: createMerchantDto.updated_by,  
        },  
      });  
    } catch (error) {  
      if (error instanceof Prisma.PrismaClientKnownRequestError) {  
        if (error.code === 'P2002') {  
          throw new HttpException(  
            'There is a unique constraint violation',  
            HttpStatus.BAD_REQUEST,  
          );  
        } else if (error.code === 'P2003') {  
          throw new HttpException(  
            'Foreign key constraint violation',  
            HttpStatus.BAD_REQUEST,  
          );  
        }  
      }  
      throw new HttpException(error, HttpStatus.BAD_REQUEST);  
    }  
  }

  async createBulk(fileName: string): Promise<any> {
    const response: {
      line: number;
      collName: string;
      messageErr: string;
    }[] = [];
    const dataCreateMerchant: CreateMerchantDto[] = [];
    try {
      // const filePath = path.resolve(__dirname, 'olympic-hockey-player.xlsx');
      const filePath = './public/temp_files/' + fileName;
      const workBook = readFile(filePath);

      const workSheets = workBook.Sheets[workBook.SheetNames[0]];

      // Get the range of the sheet
      const range = utils.decode_range(workSheets['!ref']);

      // Get the number of rows
      const rowCount = range.e.r - range.s.r + 2;

      for (let index = 2; index < rowCount; index++) {
        const colA = workSheets[`A${index}`]?.v;
        const colB = workSheets[`B${index}`]?.v;
        const colC = workSheets[`C${index}`]?.v;
        const colD = workSheets[`D${index}`]?.v;
        const colE = workSheets[`E${index}`]?.v;
        const colF = workSheets[`F${index}`]?.v;
        const colG = workSheets[`G${index}`]?.v;
        const colH = workSheets[`H${index}`]?.v;
        const colI = workSheets[`I${index}`]?.v;
        const colJ = workSheets[`J${index}`]?.v;
        const colK = workSheets[`K${index}`]?.v;
        const colL = workSheets[`L${index}`]?.v;
        const colM = workSheets[`M${index}`]?.v;
        const colN = workSheets[`N${index}`]?.v;
        const colO = workSheets[`O${index}`]?.v;
        const colP = workSheets[`P${index}`]?.v;
        const colQ = workSheets[`Q${index}`]?.v;
        const colR = workSheets[`R${index}`]?.v;

        if (!colA) {
          response.push({
            line: index,
            collName: 'Merek EDC',
            messageErr: 'Merek EDC baris ' + index + ' wajib diisi',
          });
        }

        if (!colB) {
          response.push({
            line: index,
            collName: 'Type EDC',
            messageErr: 'Type EDC baris ' + index + ' wajib diisi',
          });
        }

        if (!colC) {
          response.push({
            line: index,
            collName: 'Serial Number',
            messageErr: 'Serial Number baris ' + index + ' wajib diisi',
          });
        }

        if (!colD && colP?.toUpperCase() === 'TERPASANG') {
          response.push({
            line: index,
            collName: 'TID',
            messageErr:
              'TID baris ' + index + ' wajib diisi, karena Status TERPASANG',
          });
        }

        if (!colE) {
          response.push({
            line: index,
            collName: 'Kode Wilayah',
            messageErr: 'Kode Wilayah baris ' + index + ' wajib diisi',
          });
        }

        if (!colF) {
          response.push({
            line: index,
            collName: 'Status Milik',
            messageErr: 'Status Milik baris ' + index + ' wajib diisi',
          });
        }

        if (!colG) {
          response.push({
            line: index,
            collName: 'Kondisi Mesin',
            messageErr: 'Kondisi Mesin baris ' + index + ' wajib diisi',
          });
        }

        if (!colH && colG?.toUpperCase() === 'RUSAK') {
          response.push({
            line: index,
            collName: 'Jenis Kerusakan',
            messageErr: 'Jenis Kerusakan baris ' + index + ' wajib diisi',
          });
        }

        if (!colI) {
          response.push({
            line: index,
            collName: 'Kelengkapan',
            messageErr: 'Kelengkapan baris ' + index + ' wajib diisi',
          });
        }

        if (!colK) {
          response.push({
            line: index,
            collName: 'Tanggal Masuk',
            messageErr: 'Tanggal Masuk baris ' + index + ' wajib diisi',
          });
        }
        if (!colL) {
          response.push({
            line: index,
            collName: 'Provider Simcard',
            messageErr: 'Provider Simcard baris ' + index + ' wajib diisi',
          });
        }
        if (!colM) {
          response.push({
            line: index,
            collName: 'Nomor Simcard',
            messageErr: 'Nomor Simcard baris ' + index + ' wajib diisi',
          });
        }
        if (!colN) {
          response.push({
            line: index,
            collName: 'Penggunaan',
            messageErr: 'Penggunaan baris ' + index + ' wajib diisi',
          });
        }
        if (
          !colO &&
          (colF?.toUpperCase() === 'SEWA' ||
            colP?.toUpperCase() === 'TERPASANG')
        ) {
          response.push({
            line: index,
            collName: 'Kode Vendor',
            messageErr: 'Kode Vendor baris ' + index + ' wajib diisi',
          });
        }
        if (!colP) {
          response.push({
            line: index,
            collName: 'Status',
            messageErr: 'Status baris ' + index + ' wajib diisi',
          });
        }
        if (!colQ) {
          response.push({
            line: index,
            collName: 'MID',
            messageErr: 'MID baris ' + index + ' wajib diisi',
          });
        }
        if (!colR && colP?.toUpperCase() === 'TERPASANG') {
          response.push({
            line: index,
            collName: 'Ruang Lingkup',
            messageErr: 'Ruang Lingkup baris ' + index + ' wajib diisi',
          });
        }

        console.log({
          colA,
          colB,
          colC,
          colD,
          colE,
          colF,
          colG,
          colH,
          colI,
          colJ,
          colK,
          colL,
          colM,
          colN,
          colO,
          colP,
          colQ,
          colR,
        });
      }
      console.log('response?', response);
      deleteFile(filePath);
      if (response.length > 0) {
        return response;
      } else {
        dataCreateMerchant.map((val, index) => {
          this.create({
            region_id: val.region_id,
            mid: val.mid,
            name: val.name,
            category: val.category,
            customer_name: val.customer_name,
            telephone: val.telephone,
            pic: val.pic,
            phone1: val.phone1,
            phone2: val.phone2,
            address1: val.address1,
            address2: val.address2,
            address3: val.address3,
            address4: val.address4,
            district: val.district,
            subdistrict: val.subdistrict,
            city: val.city,
            province: val.province,
            postal_code: val.postal_code,
            status: val.status || "Waiting",
            created_by: val.created_by,
            updated_by: val.updated_by,
          });
        });      }
    } catch (error) {
      console.log('error?', error);
      return 'error';
    }
  }

  async findAll(
    pageOptionsDto: PageOptionsDto & GetMerchantQuery,
  ): Promise<any> {
    try {
      let where: any = {};
      const skip = (+pageOptionsDto.page - 1) * +pageOptionsDto.take || 0;

      const result = await this.prisma.merchant.findMany({
        skip: +skip,
        where: {
          ...where,
        },
        take: +pageOptionsDto.take,
        orderBy: {
          id: 'desc',
        },
      });

      const countAll = await this.prisma.merchant.count({
        where: {
          ...where,
          deleted_at: null,
        },
      });

      const pageMetaDto = new PageMetaDto({
        itemCount: countAll,
        pageOptionsDto,
      });
      return new PageDto(result, pageMetaDto);
    } catch (error) {
      return error;
    }
  }

  /**
   * Fetch a single merchant by its unique ID.
   * Ensures that the merchant is not soft-deleted (`deleted_at` is null).
   * @param id - The unique identifier of the merchant.
   * @returns The merchant entity.
   * @throws NotFoundException if the merchant doesn't exist or is deleted.
   */
  async findOne(id: number): Promise<Merchant> {
    try {
      const merchant = await this.prisma.merchant.findUnique({
        where: { id }, // Only unique `id` is used here
        include: { region: true }, // Include related region data if needed
      });

      if (!merchant || merchant.deleted_at) {
        throw new NotFoundException(`Merchant with ID ${id} not found.`);
      }

      return merchant;
    } catch (error) {
      console.error('Error fetching merchant by ID:', error);
      throw new InternalServerErrorException('Error fetching merchant by ID.');
    }
  }


  async update(id: number, updateMerchantDto: UpdateMerchantDto): Promise<any> {
    try {
      const result = await this.prisma.merchant.update({
        where: { id: +id },
        data: {
          region_id: updateMerchantDto.region_id,
          name: updateMerchantDto.name,
          category: updateMerchantDto.category,
          customer_name: updateMerchantDto.customer_name,
          telephone: updateMerchantDto.telephone,
          pic: updateMerchantDto.pic,
          phone1: updateMerchantDto.phone1,
          phone2: updateMerchantDto.phone2,
          address1: updateMerchantDto.address1,
          address2: updateMerchantDto.address2,
          address3: updateMerchantDto.address3,
          address4: updateMerchantDto.address4,
          district: updateMerchantDto.district,
          subdistrict: updateMerchantDto.subdistrict,
          city: updateMerchantDto.city,
          province: updateMerchantDto.province,
          postal_code: updateMerchantDto.postal_code,
          created_by: updateMerchantDto.created_by,
          updated_by: updateMerchantDto.updated_by,
        },
      });
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(id: number): Promise<any> {
    try {
      return this.prisma.merchant.delete({ where: { id: +id } });
    } catch (error) {
      throw new Error(error);
    }
  }

   /**
   * Fetch merchants for dropdown selection.
   * Retrieves only `id` and `name` of merchants that are not deleted.
   * @returns An array of merchants with `id` and `name`.
   * @throws InternalServerErrorException if the query fails.
   */
   async getMerchantsForDropdown(): Promise<{ id: number; name: string }[]> {
    try {
      const merchants = await this.prisma.merchant.findMany({
        where: { deleted_at: null }, // Only include merchants that are not deleted
        select: { id: true, name: true }, // Select only necessary fields
        orderBy: { name: 'asc' }, // Optional: order by name for better UX
      });

      return merchants;
    } catch (error) {
      console.error('Error fetching merchants for dropdown:', error);
      throw new InternalServerErrorException('Failed to fetch merchants for dropdown.');
    }
  }
}