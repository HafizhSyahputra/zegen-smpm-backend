// src/approve-merchant/approve-merchant.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApproveMerchant, Prisma } from '@prisma/client';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ColumnApprovedMerchant } from '@smpm/common/constants/enum';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { UpdateApproveMerchantDto, RejectApproveMerchantDto } from './dto/update-approve-merchant.dto';
import { MerchantService } from '@smpm/merchant/merchant.service'; 
import { CreateMerchantDto } from '@smpm/merchant/dto/create-merchant.dto';
import { UpdateMerchantDto } from '@smpm/merchant/dto/update-merchant.dto';
import { Request } from 'express'; // Pastikan import Request dari 'express'
import { CreateApproveMerchantDto } from './dto/create-approve-merchant.dto';
import { PageOptionApproveMerchantDto } from './dto/page-option-approve-merchant.dto';
import { ApprovalType } from './types/approve-merchant.types';
import { DocumentMerchantService } from '@smpm/document-merchant/document-merchant.service';

@Injectable()
export class ApproveMerchantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly merchantService: MerchantService,
    private readonly docmerchantService: DocumentMerchantService,
  ) {}

  async create(createApproveMerchantDto: CreateApproveMerchantDto, user: any, req: Request): Promise<ApproveMerchant> {
    try {
      return await this.prisma.approveMerchant.create({
        data: {
          ...createApproveMerchantDto,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    } catch (error) {
      console.error('Error creating ApproveMerchant:', error);
      throw new BadRequestException('Failed to create ApproveMerchant record.');
    }
  }

  async findAll(
    pageOptionApproveMerchantDto: PageOptionApproveMerchantDto,
    additionalFilter?: Prisma.ApproveMerchantWhereInput
  ): Promise<PageDto<ApproveMerchant>> {
    const { skip, take, order, order_by, search, search_by, type } = pageOptionApproveMerchantDto;
    
    let filter: Prisma.ApproveMerchantWhereInput = {
      deleted_at: null,
    };
  
    if (search && search_by && search_by.length > 0) {
      filter.OR = search_by.map((field: ColumnApprovedMerchant) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }
  
    if (type) {
      filter.type = type;
    }
  
    // Menggabungkan filter tambahan jika ada
    if (additionalFilter) {
      filter = { ...filter, ...additionalFilter };
    }

    const orderBy: Prisma.ApproveMerchantOrderByWithRelationInput = {};

    if (order_by) {
      orderBy[order_by] = order;
    } else {
      orderBy.id = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.approveMerchant.findMany({
        where: filter,
        skip,
        take,
        orderBy,
        include: {
          merchant: true,
        },
      }),
      this.prisma.approveMerchant.count({ where: filter }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: pageOptionApproveMerchantDto,
    });

    return new PageDto(items, pageMetaDto);
  }

  async findOne(id: number): Promise<ApproveMerchant | null> {
    return this.prisma.approveMerchant.findUnique({
      where: { id },
      include: {
        merchant: true,
      },
    });
  }

  async findByType(
    type: string,
    pageOptionApproveMerchantDto: PageOptionApproveMerchantDto,
  ): Promise<PageDto<ApproveMerchant>> {
    const { skip, take, order, order_by, search, search_by } = pageOptionApproveMerchantDto;

    const filter: Prisma.ApproveMerchantWhereInput = {
      type,
      deleted_at: null,
    };

    if (search && search_by && search_by.length > 0) {
      filter.OR = search_by.map((field: ColumnApprovedMerchant) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    const orderBy: Prisma.ApproveMerchantOrderByWithRelationInput = {};

    if (order_by) {
      orderBy[order_by] = order;
    } else {
      orderBy.id = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.approveMerchant.findMany({
        where: filter,
        skip,
        take,
        orderBy,
        include: {
          merchant: true,
        },
      }),
      this.prisma.approveMerchant.count({ where: filter }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: pageOptionApproveMerchantDto,
    });

    return new PageDto(items, pageMetaDto);
  }

  async findManyByIds(ids: number[]): Promise<ApproveMerchant[]> {  
    return this.prisma.approveMerchant.findMany({  
      where: {  
        id: { in: ids },  
        deleted_at: null,  
      },  
    });  
  }

  async update(id: number, updateApproveMerchantDto: UpdateApproveMerchantDto): Promise<ApproveMerchant> {
    const approveMerchant = await this.findOne(id);
    if (!approveMerchant) {
      throw new BadRequestException('ApproveMerchant not found.');
    }

    return this.prisma.approveMerchant.update({
      where: { id },
      data: {
        ...updateApproveMerchantDto,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: number): Promise<ApproveMerchant> {
    const approveMerchant = await this.findOne(id);
    if (!approveMerchant) {
      throw new BadRequestException('ApproveMerchant not found.');
    }

    return this.prisma.approveMerchant.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  // Fungsi untuk menyetujui ApproveMerchant
  async approveItem(id: number, userId: number): Promise<ApproveMerchant> {  
    const approveMerchant = await this.findOne(id);
    if (!approveMerchant) {
        throw new BadRequestException('Data not found.');
    }

    // Pastikan status 'Waiting' dapat disetujui
    if (approveMerchant.status !== 'Waiting') {
        throw new BadRequestException(`Cannot approve a record with status ${approveMerchant.status}.`);
    }

    // Lakukan pembaruan status dan simpan
    const updatedApproveMerchant = await this.prisma.approveMerchant.update({  
        where: { id },  
        data: {   
            status: 'Approved',  
            approved_by: userId,   
            updated_at: new Date(),  
        },  
    });

     try {
        switch (approveMerchant.type) {
            case 'Add':
                const newMerchantData: CreateMerchantDto = JSON.parse(approveMerchant.DataAfter);
                const createdMerchant = await this.merchantService.create(newMerchantData);
                const location = createdMerchant.address1 + ' ' + createdMerchant.address2 + ' ' + createdMerchant.address3 + ' ' + createdMerchant.address4 + ', ' + createdMerchant.postal_code;

                await this.docmerchantService.create({  
                  merchant_id: createdMerchant.id,  
                  region_id: createdMerchant.region_id,
                  location : location,
                  created_by: userId,  
                });  
                break;
            case 'Edit':
                const editedMerchantData: UpdateMerchantDto = JSON.parse(approveMerchant.DataAfter);
                await this.merchantService.update(approveMerchant.merchant_id, editedMerchantData);
                break;
            case 'Delete':
                await this.merchantService.remove(approveMerchant.merchant_id);
                break;
            default:
                throw new BadRequestException(`Unknown type ${approveMerchant.type}.`);
        }
    } catch (error) {
        console.error('Error performing CRUD operation on Merchant:', error);
        throw new BadRequestException('Failed to perform CRUD operation on Merchant.');
    }

    return updatedApproveMerchant;
}

  // Fungsi untuk menolak ApproveMerchant
  async rejectItem(
    id: number,
    reason: string,
    info_remark: string,
    userId: number
  ): Promise<ApproveMerchant> {  
    const approveMerchant = await this.findOne(id);
    if (!approveMerchant) {
      throw new BadRequestException('ApproveMerchant not found.');
    }

    if (approveMerchant.status !== 'Waiting') {
      throw new BadRequestException(`Cannot reject a record with status ${approveMerchant.status}.`);
    }

    return this.prisma.approveMerchant.update({  
      where: { id },  
      data: {  
        status: 'Rejected',  
        reason,  
        info_remark,  
        rejected_by: userId,  
        approved_by: null,    
        updated_by: userId,  
      },  
    });  
  }

  // Bulk Approve
  async bulkApprove(ids: number[], userId: number): Promise<{ count: number }> {  
    const approveMerchants = await this.prisma.approveMerchant.findMany({
      where: {
        id: { in: ids },
        status: 'Waiting',
        deleted_at: null,
      },
    });

    if (approveMerchants.length === 0) {
      throw new BadRequestException('No approve records found for the provided IDs or they are not in Waiting status.');
    }

    // Perform approval for all matching records
    const updatedResult = await this.prisma.approveMerchant.updateMany({  
      where: {  
        id: { in: ids },
        status: 'Waiting',
        deleted_at: null,
      },  
      data: {  
        status: 'Approved',  
        approved_by: userId,  
        rejected_by: null,
        updated_by: userId,  
      }  
    });  

    // For each approved record, perform the corresponding CRUD operation
    for (const approveMerchant of approveMerchants) {
      try {
        switch (approveMerchant.type) {
          case 'Add':
            const newMerchantData: CreateMerchantDto = JSON.parse(approveMerchant.DataAfter);
            await this.merchantService.create(newMerchantData);
            break;
          case 'Edit':
            const editedMerchantData: UpdateMerchantDto = JSON.parse(approveMerchant.DataAfter);
            await this.merchantService.update(approveMerchant.merchant_id, editedMerchantData);
            break;
          case 'Delete':
            await this.merchantService.remove(approveMerchant.merchant_id);
            break;
          default:
            console.warn(`Unknown type ${approveMerchant.type} for ApproveMerchant ID ${approveMerchant.id}. Skipping.`);
        }
      } catch (error) {
        console.error(`Error performing CRUD operation for ApproveMerchant ID ${approveMerchant.id}:`, error);
        // Optionally, Anda bisa menambahkan logika rollback atau notifikasi di sini
      }
    }

    return { count: updatedResult.count };
  }

  async getApprovalStatistics(): Promise<{ waiting: number; approved: number; rejected: number }> {
    const stats = await this.prisma.approveMerchant.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      where: {
        deleted_at: null,
      },
    });

    return stats.reduce((acc, curr) => {
      acc[curr.status.toLowerCase() as 'waiting' | 'approved' | 'rejected'] = curr._count.status;
      return acc;
    }, { waiting: 0, approved: 0, rejected: 0 });
  }

  async getWaitingApprovals(pageOptionApproveMerchantDto: PageOptionApproveMerchantDto): Promise<PageDto<ApproveMerchant>> {
    return this.findAll({
      ...pageOptionApproveMerchantDto,
      search: 'Waiting',
      search_by: [ColumnApprovedMerchant.status],
      type: undefined, // Ensure type filter is not applied
      skip: 0
    });
  }

  async getWaitingApprovalsByType(
    type: ApprovalType,
    pageOptionApproveMerchantDto: PageOptionApproveMerchantDto
  ): Promise<PageDto<ApproveMerchant>> {
    const additionalFilter: Prisma.ApproveMerchantWhereInput = {
      type,
      status: 'Waiting'
    };
  
    return this.findAll(pageOptionApproveMerchantDto, additionalFilter);
  }

  async getApprovedRejectedByType(
    type: ApprovalType,
    pageOptionApproveMerchantDto: PageOptionApproveMerchantDto
  ): Promise<PageDto<ApproveMerchant>> {
    const additionalFilter: Prisma.ApproveMerchantWhereInput = {
      type,
      OR: [
        { status: 'Approved' },
        { status: 'Rejected' }
      ]
    };
  
    return this.findAll(pageOptionApproveMerchantDto, additionalFilter);
  }
}