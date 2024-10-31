import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SLA } from '@prisma/client';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ColumnSLA } from '@smpm/common/constants/enum';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { PageOptionSLADto } from './dto/page-option-sla.dto';
import { UpdateSlaDto } from './dto/update-sla.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SlaService {
  private readonly logger = new Logger(SlaService.name);
  private readonly BATCH_SIZE = 100;  

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('sla-update') private readonly slaQueue: Queue,
  ) {}

  async findAll(pageOptionSLADto: PageOptionSLADto): Promise<PageDto<SLA>> {
    const { skip, take, order, order_by, search, search_by } = pageOptionSLADto;

    const filter: Prisma.SLAWhereInput = {
      deleted_at: null,
    };
    const orderBy: Prisma.SLAOrderByWithRelationInput = {};

    if (search && search_by) {
      filter.OR = search_by.map((field: ColumnSLA) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    if (order_by) {
      orderBy[order_by] = order;
    } else {
      orderBy[ColumnSLA.id] = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.sLA.findMany({
        where: filter,
        skip,
        take,
        orderBy,
        include: {
          slaRegion: true,
          regionGroup: true,
          vendor: true,
          region: true,
          merchant: true,
          edc: true,
        },
      }),
      this.prisma.sLA.count({ where: filter }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: pageOptionSLADto,
    });

    return new PageDto(items, pageMetaDto);
  }

  async findOne(id: number): Promise<SLA | null> {
    return this.prisma.sLA.findUnique({
      where: { id, deleted_at: null },
      include: {
        slaRegion: true,
        regionGroup: true,
        vendor: true,
        region: true,
        merchant: true,
        edc: true,
      },
    });
  }

  async findManyByIds(ids: number[]): Promise<SLA[]> {
    return this.prisma.sLA.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async update(id: number, updateSLADto: UpdateSlaDto): Promise<SLA> {
    return this.prisma.sLA.update({
      where: { id },
      data: updateSLADto,
    });
  }

  async remove(id: number): Promise<SLA> {
    return this.prisma.sLA.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async updateDurationBatch(): Promise<{   
    totalUpdated: number;  
    totalProcessed: number;  
  }> {  
    const now = new Date();  
    let processed = 0;  
    let updated = 0;  
    let currentBatch = 0;  
    
    try {  
      let hasMore = true;  
      
      while (hasMore) {  
        // Fetch records in smaller batches  
        const records = await this.prisma.sLA.findMany({  
          where: {  
            target_time: { lt: now },  
            solved_time: null,  
            deleted_at: null,  
          },  
          select: {  
            id: true,  
            target_time: true,  
            duration: true,  
          },  
          skip: currentBatch * this.BATCH_SIZE,  
          take: this.BATCH_SIZE,  
        });  

        if (records.length === 0) {  
          hasMore = false;  
          break;  
        }  

        // Process current batch  
        const batchResult = await this.processRecordsBatch(records, now);  
        updated += batchResult;  
        processed += records.length;  
        currentBatch++;  

        this.logger.log(  
          `Processed batch ${currentBatch}: ${records.length} records, ` +  
          `${batchResult} updated. Total: ${processed} processed, ${updated} updated`  
        );  

        // Small delay between batches to prevent overwhelming the database  
        await new Promise(resolve => setTimeout(resolve, 100));  
      }  

      return { totalUpdated: updated, totalProcessed: processed };  
    } catch (error) {  
      this.logger.error('Error in updateDurationBatch:', error);  
      throw error;  
    }  
  }  

  private async processRecordsBatch(records: any[], now: Date): Promise<number> {  
    let updatedInBatch = 0;  

    try {  
      await this.prisma.$transaction(async (tx) => {  
        for (const record of records) {  
          const targetTime = new Date(record.target_time);  
          if (isNaN(targetTime.getTime())) {  
            this.logger.warn(`Invalid target_time for SLA ID ${record.id}`);  
            continue;  
          }  

          const elapsedMs = now.getTime() - targetTime.getTime();  
          const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));  
          const newDuration = Math.max(elapsedHours, record.duration || 0);  

          await tx.sLA.update({  
            where: { id: record.id },  
            data: {  
              duration: newDuration,  
              status_sla: 'Not Archived',  
              updated_at: now,  
            },  
          });  

          updatedInBatch++;  
        }  
      });  

      return updatedInBatch;  
    } catch (error) {  
      this.logger.error(`Error processing batch:`, error);  
      throw error;  
    }  
  }  

  @Cron(CronExpression.EVERY_HOUR)  
  async handleCronUpdateDuration() {  
    this.logger.log('Starting scheduled SLA duration update');  
    try {  
      await this.slaQueue.add(  
        'update-duration',  
        { timestamp: new Date().toISOString() },  
        {   
          attempts: 3,  
          backoff: {  
            type: 'exponential',  
            delay: 5000  
          }  
        }  
      );  
    } catch (error) {  
      this.logger.error('Failed to queue SLA update:', error);  
    }  
  }  
}  
