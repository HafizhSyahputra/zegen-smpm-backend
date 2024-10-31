// src/electronic-data-capture/electronic-data-capture.service.ts

import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { CreateElectronicDataCaptureDto } from './dto/create-electronic-data-capture.dto';
import { UpdateElectronicDataCaptureDto } from './dto/update-electronic-data-capture.dto';
import { ElectronicDataCapture } from './entities/electronic-data-capture.entity';
import { EdcBrandType, ElectronicDataCaptureMachine, Prisma, PrismaClient, ProviderSimcard } from '@prisma/client';
import { GetEdcBrandTypeDto } from './dto/get-edc-brand-type.dto';
import * as ExcelJS from 'exceljs';
import { GetElectronicDataCaptureDto } from './dto/get-electronic-data-capture';
import { ProviderEntity } from './entities/provider.entity';

@Injectable()
export class ElectronicDataCaptureService {
  private readonly logger = new Logger(ElectronicDataCaptureService.name);
  constructor(private prisma: PrismaService) {}

  private readonly includeRelations = {
    owner: true,
    merchant: true,
    ReceivedIn: true,
    ReceivedOut: true,
    ActivityVendorReport: true,
  };

  /**
   * Membuat entri baru untuk ElectronicDataCaptureMachine dengan pre-validasi
   */
  async create(
    createElectronicDataCaptureDto: CreateElectronicDataCaptureDto,
    user: any,
  ): Promise<ElectronicDataCaptureMachine> {
    const { tid, serial_number, owner_id } = createElectronicDataCaptureDto;

    // Pre-validation: Cek apakah TID sudah ada
    const existingTid = await this.prisma.electronicDataCaptureMachine.findUnique({
      where: { tid },
    });
    if (existingTid) {
      throw new BadRequestException(`TID "${tid}" sudah digunakan.`);
    }

    // Pre-validation: Cek apakah Serial Number sudah ada
    const existingSerialNumber = await this.prisma.electronicDataCaptureMachine.findUnique({
      where: { serial_number },
    });
    if (existingSerialNumber) {
      throw new BadRequestException(`Serial Number "${serial_number}" sudah digunakan.`);
    }

    // Pre-validation: Cek apakah owner_id valid
    const existingOwner = await this.prisma.vendor.findUnique({ where: { id: owner_id } });
    if (!existingOwner) {
      throw new BadRequestException(`Owner dengan ID "${owner_id}" tidak ditemukan.`);
    }

    try {
      return await this.prisma.electronicDataCaptureMachine.create({
        data: {
          ...createElectronicDataCaptureDto,
          created_by: createElectronicDataCaptureDto.created_by ?? user.id,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const fields = (error.meta.target as string[]) || [];
        const fieldList = fields.join(', ');
        throw new BadRequestException(`Unique constraint failed on the fields: ${fieldList}.`);
      } else if (error.code === 'P2003') {
        throw new BadRequestException('Foreign key constraint violated: Ensure all related entities exist.');
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Mengambil semua entri ElectronicDataCaptureMachine tanpa pagination
   */
  async getAll(): Promise<ElectronicDataCaptureMachine[]> {
    try {
      return await this.prisma.electronicDataCaptureMachine.findMany({
        include: this.includeRelations,
        where: {
          deleted_at: null,
        },
      });
    } catch (error: any) {
      console.error('Error fetching all EDC Machines:', error);
      throw new InternalServerErrorException('Failed to fetch all Electronic Data Capture Machines.');
    }
  }

  /**
   * Bulk creates ElectronicDataCaptureMachine records dari file Excel yang diupload
   */
  async bulkCreate(file: Express.Multer.File, user: any): Promise<{ success: number; failed: number; errors: any[] }> {
    const workbook = new ExcelJS.Workbook();
    try {
      // Load file Excel
      await workbook.xlsx.load(file.buffer);
      const worksheet = workbook.worksheets[0];
      const rows = [];

      // Parsing data dan cek duplikasi internal di file Excel
      const usedTids = new Set<string>();
      const usedSerialNumbers = new Set<string>();
      const usedSimcardNumbers = new Set<string>();

      // Inisialisasi counters
      let success = 0;
      let failed = 0;
      const errors = [];

      // Pastikan informasi pengguna tersedia
      if (!user || typeof user.id === 'undefined') {
        throw new InternalServerErrorException('User information is not available or incomplete.');
      }

      // Parsing data dari Excel dengan validasi internal
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) { // Skip header
        const row = worksheet.getRow(rowNumber);
        const data = {
          mid: row.getCell('A').value?.toString()?.trim(),
          tid: row.getCell('B').value?.toString()?.trim(),
          brand: row.getCell('C').value?.toString()?.trim(),
          brand_type: row.getCell('D').value?.toString()?.trim(),
          serial_number: row.getCell('E').value?.toString()?.trim(),
          status_owner: row.getCell('F').value?.toString()?.trim(),
          status_owner_desc: row.getCell('G').value?.toString()?.trim(),
          status_machine: row.getCell('H').value?.toString()?.trim(),
          status_machine_desc: row.getCell('I').value?.toString()?.trim(),
          status_active: row.getCell('J').value === 'true' || row.getCell('J').value === true,
          simcard_provider: row.getCell('K').value?.toString()?.trim(),
          simcard_number: row.getCell('L').value?.toString()?.trim(),
          region: row.getCell('M').value?.toString()?.trim(),
          info: row.getCell('N').value?.toString()?.trim(),
          kondisibarang: row.getCell('O').value?.toString()?.trim(),
          vendor_name: row.getCell('P').value?.toString()?.trim(),
        };

        // Cek duplikasi internal dalam file Excel
        if (data.tid && usedTids.has(data.tid)) {
          failed++;
          errors.push({ row: rowNumber, error: `Duplicate TID "${data.tid}" found in the file.` });
          continue;
        }

        if (data.serial_number && usedSerialNumbers.has(data.serial_number)) {
          failed++;
          errors.push({ row: rowNumber, error: `Duplicate Serial Number "${data.serial_number}" found in the file.` });
          continue;
        }

        if (data.simcard_number && usedSimcardNumbers.has(data.simcard_number)) {
          failed++;
          errors.push({ row: rowNumber, error: `Duplicate Simcard Number "${data.simcard_number}" found in the file.` });
          continue;
        }

        if (data.tid) usedTids.add(data.tid);
        if (data.serial_number) usedSerialNumbers.add(data.serial_number);
        if (data.simcard_number) usedSimcardNumbers.add(data.simcard_number);

        rows.push({ rowNumber, data });
      }

      if (rows.length === 0) {
        throw new InternalServerErrorException('File Excel tidak mengandung data yang valid.');
      }

      // Mengambil semua nilai unik yang ingin diinsert
      const allTids = rows.map(row => row.data.tid);
      const allSerialNumbers = rows.map(row => row.data.serial_number);
      const allSimcardNumbers = rows.map(row => row.data.simcard_number);

      // Mengambil data yang sudah ada di database untuk mengurangi jumlah query
      const existingEDCs = await this.prisma.electronicDataCaptureMachine.findMany({
        where: {
          OR: [
            { tid: { in: allTids } },
            { serial_number: { in: allSerialNumbers } },
            { simcard_number: { in: allSimcardNumbers } },
          ],
        },
      });

      // Membuat Set untuk pencarian cepat
      const existingTids = new Set(existingEDCs.map(edc => edc.tid));
      const existingSerialNumbers = new Set(existingEDCs.map(edc => edc.serial_number));
      const existingSimcardNumbers = new Set(existingEDCs.map(edc => edc.simcard_number));

      for (const row of rows) {
        const excelRowNumber = row.rowNumber;
        const data = row.data;

        // Cek duplikasi di database
        if (data.tid && existingTids.has(data.tid)) {
          failed++;
          errors.push({ row: excelRowNumber, error: `Duplicate TID "${data.tid}" found in the database.` });
          continue;
        }

        if (data.serial_number && existingSerialNumbers.has(data.serial_number)) {
          failed++;
          errors.push({ row: excelRowNumber, error: `Duplicate Serial Number "${data.serial_number}" found in the database.` });
          continue;
        }

        if (data.simcard_number && existingSimcardNumbers.has(data.simcard_number)) {
          failed++;
          errors.push({ row: excelRowNumber, error: `Duplicate Simcard Number "${data.simcard_number}" found in the database.` });
          continue;
        }

        // Resolve owner_id berdasarkan vendor_name dan jenis
        let owner_id: number | null = null;
        if (data.status_owner.toLowerCase() === 'milik') {
          const vendor = await this.prisma.vendor.findFirst({
            where: {
              name: data.vendor_name,
              jenis: 'milik',
              deleted_at: null,
            },
          });
          if (vendor) {
            owner_id = vendor.id;
          } else {
            failed++;
            errors.push({ row: excelRowNumber, error: `Vendor dengan nama "${data.vendor_name}" dan jenis "milik" tidak ditemukan.` });
            continue;
          }
        } else if (data.status_owner.toLowerCase() === 'sewa') {
          const vendor = await this.prisma.vendor.findFirst({
            where: {
              name: data.vendor_name,
              jenis: 'sewa',
              deleted_at: null,
            },
          });
          if (vendor) {
            owner_id = vendor.id;
          } else {
            failed++;
            errors.push({ row: excelRowNumber, error: `Vendor dengan nama "${data.vendor_name}" dan jenis "sewa" tidak ditemukan.` });
            continue;
          }
        } else {
          failed++;
          errors.push({ row: excelRowNumber, error: `Status Kepemilikan "${data.status_owner}" tidak valid.` });
          continue;
        }

        // Set field terkait pengguna
        data.owner_id = owner_id;
        data.created_by = user.id;
        data.updated_by = user.id;

        // Insert data ke database
        try {
          await this.prisma.electronicDataCaptureMachine.create({
            data: {
              owner_id: data.owner_id,
              mid: data.mid,
              tid: data.tid,
              brand: data.brand,
              brand_type: data.brand_type,
              serial_number: data.serial_number,
              status_owner: data.status_owner,
              status_owner_desc: data.status_owner_desc,
              status_machine: data.status_machine,
              status_machine_desc: data.status_machine_desc,
              status_active: data.status_active,
              simcard_provider: data.simcard_provider,
              simcard_number: data.simcard_number,
              region: data.region,
              info: data.info,
              kondisibarang: data.kondisibarang,
              created_by: data.created_by,
              updated_by: data.updated_by,
            },
          });
          success++;
        } catch (err: any) {
          failed++;
          console.error(`Error creating EDC Machine at row ${excelRowNumber}:`, err);

          if (err.code === 'P2002') {
            const constraints = err.meta.target as string[];
            const fields = constraints.join(', ');
            errors.push({ row: excelRowNumber, error: `Unique constraint failed on the fields: ${fields}.` });
          } else if (err.code === 'P2003') {
            errors.push({ row: excelRowNumber, error: 'Foreign key constraint violated: Ensure owner_id exists.' });
          } else {
            errors.push({ row: excelRowNumber, error: err.message });
          }
        }
      }

      return { success, failed, errors };
    } catch (error: any) {
      console.error('Error processing Excel file:', error);
      throw new InternalServerErrorException('Error processing Excel file: ' + error.message);
    }
  }

  /**
   * Mengambil semua data dengan pagination
   */
  
async findAll(filterDto: GetElectronicDataCaptureDto): Promise<PageDto<ElectronicDataCaptureMachine>> {
  const {
    skip,
    take,
    simcard_provider,
    region,
    status_owner,
    brand,
    merchant_id,
    status_active,
    status_edc,
  } = filterDto;

  // Build the where condition based on provided filters
  const where: Prisma.ElectronicDataCaptureMachineWhereInput = {
    deleted_at: null,
    ...(simcard_provider && simcard_provider.length > 0 && { simcard_provider: { in: simcard_provider } }),
    ...(region && region.length > 0 && { region: { in: region } }),
    ...(status_owner && status_owner.length > 0 && { status_owner: { in: status_owner } }),
    ...(brand && brand.length > 0 && { brand: { in: brand } }),
    ...(merchant_id && merchant_id.length > 0 && { merchant_id: { in: merchant_id } }),
    ...(status_edc && status_edc.length > 0 && { status_edc: { in: status_edc } }),
    ...(typeof status_active !== 'undefined' && { status_active }),
  };

  // Count total records matching the filters
  const countAll = await this.prisma.electronicDataCaptureMachine.count({ where });

  // Fetch the data with pagination and filters
  const data = await this.prisma.electronicDataCaptureMachine.findMany({
    skip,
    take,
    where,
    include: this.includeRelations,
  });

  // Create pagination metadata
  const pageMetaDto = new PageMetaDto({
    itemCount: countAll,
    pageOptionsDto: filterDto,
  });

  return new PageDto(data, pageMetaDto);
}
  /**
   * Mengambil satu entri berdasarkan ID
   */
  async findOne(id: number): Promise<ElectronicDataCaptureMachine | null> {
    try {
      return await this.prisma.electronicDataCaptureMachine.findFirst({
        where: {
          id: id,
          deleted_at: null, // Ensures the record is not soft-deleted
        },
        include: this.includeRelations,
      });
    } catch (error) {
      console.error('Error in findOne:', error);
      throw new InternalServerErrorException('Failed to retrieve EDC machine.');
    }
  }
  

  /**
   * Mengambil entri berdasarkan Serial Number (contoh fungsi tambahan)
   */
  async findEDCMachineBySerialNumber(serial_number: string): Promise<ElectronicDataCaptureMachine | null> {
    return this.prisma.electronicDataCaptureMachine.findFirst({
      where: {
        serial_number: serial_number.toUpperCase(),
        deleted_at: null,
      },
    });
  }

  /**
   * Memperbarui entri berdasarkan ID
   */
   // Tambahkan parameter prismaClient opsional
   async update(
    id: number,
    updateDto: UpdateElectronicDataCaptureDto,
    user: any,
    prismaClient?: Prisma.TransactionClient, // Gunakan tipe Prisma.TransactionClient
  ): Promise<ElectronicDataCaptureMachine> {
    // Gunakan prismaClient jika diberikan, jika tidak gunakan this.prisma
    const client = prismaClient || this.prisma;

    this.logger.debug(`Updating EDC Machine with ID ${id} using DTO: ${JSON.stringify(updateDto)}`);

    try {
      const updatedMachine = await client.electronicDataCaptureMachine.update({
        where: { id },
        data: {
          ...updateDto,
          updated_at: new Date(),
          updated_by: updateDto.updated_by ?? user.id,
        },
        include: {
          owner: true,
          merchant: true,
          ReceivedIn: true,
          ReceivedOut: true,
          ActivityVendorReport: true,
        },
      });

      this.logger.debug(`Successfully updated EDC Machine: ${JSON.stringify(updatedMachine)}`);
      return updatedMachine;
    } catch (error: any) {
      this.logger.error(`Failed to update EDC Machine with ID ${id}: ${error.message}`);

      if (error.code === 'P2002') {
        const fields = (error.meta?.target as string[]) || [];
        const fieldList = fields.join(', ');
        throw new BadRequestException(`Unique constraint failed on the fields: ${fieldList}.`);
      }

      throw new InternalServerErrorException(error.message);
    }
  }


  /**
   * Menghapus entri secara soft delete berdasarkan ID
   */
  async remove(id: number, user: any): Promise<ElectronicDataCaptureMachine> {
    try {
      return await this.prisma.electronicDataCaptureMachine.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: user.id },
      });
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Mengambil semua brand
   */
  async getBrand(): Promise<EdcBrandType[]> {
    return this.prisma.edcBrandType.findMany({
      distinct: 'brand',
    });
  }

  /**
   * Mengambil semua brand type berdasarkan filter
   */
  async getBrandType(
    getEdcBrandTypeDto: GetEdcBrandTypeDto,
  ): Promise<EdcBrandType[]> {
    return this.prisma.edcBrandType.findMany({
      where: {
        ...getEdcBrandTypeDto,
      },
      distinct: 'type',
    });
  }

  /**
   * Mengambil EDC Machines yang diterima masuk
   */
  async getReceivedIn(
    filterDto: GetEdcBrandTypeDto,
  ): Promise<ElectronicDataCaptureMachine[]> {
    try {
      const where: any = {
        status_edc: 'Received IN',
        deleted_at: null,
      };

      if (filterDto.brand) {
        where.brand = {
          contains: filterDto.brand,
          mode: 'insensitive',
        };
      }

      if (filterDto.type) {
        where.brand_type = {
          contains: filterDto.type,
          mode: 'insensitive',
        };
      }

      const data = await this.prisma.electronicDataCaptureMachine.findMany({
        where,
        orderBy: { id: 'desc' },
        include: this.includeRelations,
      });

      return data;
    } catch (error) {
      console.error('Error fetching Received IN EDCs:', error);
      throw new InternalServerErrorException('Failed to fetch Received IN EDCs.');
    }
  }

  /**
   * Mengambil EDC Machines yang diterima keluar
   */
  async getReceivedOut(
    filterDto: GetEdcBrandTypeDto,
  ): Promise<ElectronicDataCaptureMachine[]> {
    try {
      const where: any = {
        status_edc: 'Received Out',
        deleted_at: null,
      };

      if (filterDto.brand) {
        where.brand = {
          contains: filterDto.brand,
          mode: 'insensitive',
        };
      }

      if (filterDto.type) {
        where.brand_type = {
          contains: filterDto.type,
          mode: 'insensitive',
        };
      }

      const data = await this.prisma.electronicDataCaptureMachine.findMany({
        where,
        orderBy: { id: 'desc' },
        include: this.includeRelations,
      });

      return data;
    } catch (error) {
      console.error('Error fetching Received Out EDCs:', error);
      throw new InternalServerErrorException('Failed to fetch Received Out EDCs.');
    }
  }


  async findByMerchantId(merchantId: number): Promise<ElectronicDataCaptureMachine[]> {
    // Opsional: Cek apakah Merchant ada
    const merchantExists = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchantExists) {
      throw new BadRequestException(`Merchant dengan ID "${merchantId}" tidak ditemukan.`);
      // Atau gunakan exception khusus:
      // throw new MerchantNotFoundException(merchantId);
    }

    try {
      return await this.prisma.electronicDataCaptureMachine.findMany({
        where: {
          merchant_id: merchantId, // Sesuaikan field jika berbeda
          deleted_at: null,
        },
        include: this.includeRelations,
      });
    } catch (error: any) {
      console.error(`Error fetching EDCs for Merchant ID ${merchantId}:`, error);
      throw new InternalServerErrorException('Gagal mengambil data EDC berdasarkan Merchant ID.');
    }
  }

  async getInstalledMachines(): Promise<ElectronicDataCaptureMachine[]> {
    try {
      const where: Prisma.ElectronicDataCaptureMachineWhereInput = {
        status_edc: 'terpasang',
        deleted_at: null,
      };

      const data = await this.prisma.electronicDataCaptureMachine.findMany({
        where,
        orderBy: { id: 'desc' },
        include: this.includeRelations,
      });

      return data;
    } catch (error) {
      console.error('Error fetching installed EDC machines:', error);
      throw new InternalServerErrorException('Failed to fetch installed EDC machines.');
    }
  }

  async createProviderSimcard(providerData: ProviderEntity, user: any): Promise<ProviderSimcard> {
    try {
      return await this.prisma.providerSimcard.create({
        data: {
          name_provider: providerData.name_provider,
          created_by: user.id,
          updated_by: user.id,
        },
      });
    } catch (error: any) {
      console.error('Error creating ProviderSimcard:', error);
      throw new InternalServerErrorException('Failed to create ProviderSimcard.');
    }
  }

  async getAllProviderSimcards(): Promise<ProviderSimcard[]> {
    try {
      return await this.prisma.providerSimcard.findMany({
        where: {
          deleted_at: null,
        },
      });
    } catch (error: any) {
      console.error('Error fetching ProviderSimcards:', error);
      throw new InternalServerErrorException('Failed to fetch ProviderSimcards.');
    }
  }
}