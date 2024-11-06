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
import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';

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
          jobOrder: true,
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
        jobOrder: true,
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

        const chunkSize = 10;
        for (let i = 0; i < records.length; i += chunkSize) {
          const chunk = records.slice(i, i + chunkSize);
          const batchResult = await this.processRecordsBatch(chunk, now);
          updated += batchResult;
        }

        processed += records.length;
        currentBatch++;

        this.logger.log(
          `Processed batch ${currentBatch}: ${records.length} records, ` +
            `${updated} updated. Total: ${processed} processed`,
        );

        // Small delay between batches to prevent overwhelming the database
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return { totalUpdated: updated, totalProcessed: processed };
    } catch (error) {
      this.logger.error('Error in updateDurationBatch:', error);
      throw error;
    }
  }

  private async processRecordsBatch(
    records: any[],
    now: Date,
  ): Promise<number> {
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
            delay: 5000,
          },
        },
      );
    } catch (error) {
      this.logger.error('Failed to queue SLA update:', error);
    }
  }

  async exportJobOrderToExcel(): Promise<Buffer> {
    try {
      await this.updateDurationBatch();

      const data = await this.prisma.sLA.findMany({
        where: {
          deleted_at: null,
          status_sla: {
            in: ['Archived', 'Not Archived'],
          },
          jobOrder: {
            type: {
              not: 'Preventive Maintenance',
            },
          },
        },
        include: {
          jobOrder: true,
          edc: true,
          slaRegion: {
            include: {
              regionGroup: true,
            },
          },
          region: true,
          merchant: true,
          vendor: true,
        },
      });

      return await this.generateExcel(data, 'Job Order SLA');
    } catch (error) {
      this.logger.error('Error exporting regular SLA data to Excel:', error);
      throw new Error('Failed to export regular SLA data to Excel');
    }
  }

  async exportPreventiveToExcel(): Promise<Buffer> {
    try {
      const data = await this.prisma.sLA.findMany({
        where: {
          deleted_at: null,
          status_sla: {
            in: ['Archived', 'Not Archived'],
          },
          jobOrder: {
            type: 'Preventive Maintenance',
          },
        },
        include: {
          jobOrder: true,
          edc: true,
          slaRegion: {
            include: {
              regionGroup: true,
            },
          },
          region: true,
          merchant: true,
          vendor: true,
        },
      });

      await this.updateDurationBatch();
      return await this.generateExcel(data, 'Preventive Maintenance SLA');
    } catch (error) {
      this.logger.error('Error exporting preventive SLA data to Excel:', error);
      throw new Error('Failed to export preventive SLA data to Excel');
    }
  }

  private async generateExcel(data: any[], sheetName: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Pisahkan data berdasarkan status_sla
    const archivedData = data.filter((item) => item.status_sla === 'Archived');
    const notArchivedData = data.filter(
      (item) => item.status_sla === 'Not Archived',
    );

    const setupWorksheet = (worksheet: ExcelJS.Worksheet) => {
      const BNI_PRIMARY: ExcelJS.Fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF005E6A' },
      } as ExcelJS.FillPattern;

      worksheet.columns = [
        { header: 'Job Order No', key: 'job_order_no', width: 40 },
        { header: 'Type', key: 'type', width: 25 },
        { header: 'Serial Number', key: 'serial_number', width: 20 },
        { header: 'Merk EDC', key: 'merk_edc', width: 15 },
        { header: 'Type EDC', key: 'type_edc', width: 15 },
        { header: 'Open Time', key: 'open_time', width: 20 },
        { header: 'Target Time', key: 'target_time', width: 20 },
        { header: 'Status SLA', key: 'status_sla', width: 15 },
        { header: 'Solved Time', key: 'solved_time', width: 20 },
        { header: 'Duration', key: 'duration', width: 20 },
        { header: 'Scope', key: 'scope', width: 20 },
        { header: 'Hour', key: 'hour', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Target', key: 'target', width: 15 },
        { header: 'Group Region', key: 'group_region', width: 30 },
        { header: 'Region', key: 'wilayah', width: 20 },
        { header: 'TID', key: 'tid', width: 15 },
        { header: 'MID', key: 'mid', width: 15 },
        { header: 'Merchant', key: 'merchant_name', width: 30 },
        { header: 'Vendor Code', key: 'vendor_code', width: 18 },
        { header: 'Vendor', key: 'vendor_name', width: 30 },
      ];

      worksheet.getRow(1).font = {
        bold: true,
        color: { argb: 'FFFFFF' },
        size: 11,
      };

      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = BNI_PRIMARY;
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    };

    const formatRows = (items: any[]) =>
      items.map((item) => ({
        job_order_no: item.job_order_no,
        type: item.jobOrder?.type,
        serial_number: item.edc?.serial_number || '',
        merk_edc: item.edc?.brand || '',
        type_edc: item.edc?.brand_type || '',
        open_time: item.open_time
          ? new Date(item.open_time).toLocaleString()
          : '',
        target_time: item.target_time
          ? new Date(item.target_time).toLocaleString()
          : '',
        status_sla: item.status_sla,
        solved_time: item.solved_time
          ? new Date(item.solved_time).toLocaleString()
          : '',
        duration: item.duration ? `${item.duration} Hours` : '0 Hours',
        scope: item.jobOrder?.merchant_category || '',
        // scope: item.slaRegion?.scope || '',
        hour: item.slaRegion?.hour || 0,
        status: item.status || '',
        target: item.slaRegion?.target
          ? parseFloat(item.slaRegion.target) / 100
          : 0,
        group_region: item.slaRegion?.regionGroup?.name_group || '',
        wilayah: item.region?.name || '',
        tid: item.tid,
        mid: item.mid,
        merchant_name: item.merchant?.name || '',
        vendor_code: item.vendor?.code || '',
        vendor_name: item.vendor?.name || '',
      }));

     const styleRows = (worksheet: ExcelJS.Worksheet) => {
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.eachCell((cell, colNumber) => {
            const columnKey = worksheet.getColumn(colNumber).key;

             if (columnKey === 'duration' || columnKey === 'hour' || columnKey === 'status' || columnKey === 'scope') {
               cell.alignment = {
                vertical: 'middle',
                horizontal: 'right',
              };
            } else if (columnKey === 'target') {
               cell.alignment = {
                vertical: 'middle',
                horizontal: 'right',
              };
              cell.numFmt = '0%';
            } else if (columnKey === 'type') {
              cell.alignment = {
               vertical: 'middle',
               horizontal: 'left',
             }; 
            } else {
              cell.alignment = {
                vertical: 'middle',
                horizontal: 'center',
              };
            }

            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };

            if (rowNumber % 2 === 0) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF5F5F5' },
              };
            }
          });
        }
      });
    };

    const notArchivedSheet = workbook.addWorksheet(
      `Not Archived - ${sheetName}`,
    );
    setupWorksheet(notArchivedSheet);
    const notArchivedRows = formatRows(notArchivedData);
    notArchivedSheet.addRows(notArchivedRows);
    styleRows(notArchivedSheet);

    const archivedSheet = workbook.addWorksheet(`Archived - ${sheetName}`);
    setupWorksheet(archivedSheet);
    const archivedRows = formatRows(archivedData);
    archivedSheet.addRows(archivedRows);
    styleRows(archivedSheet);

    [notArchivedSheet, archivedSheet].forEach((sheet) => {
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: sheet.columns.length },
      };

      sheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 1,
          topLeftCell: 'A2',
          activeCell: 'A2',
        },
      ];
    });

    return (await workbook.xlsx.writeBuffer()) as Buffer;
  }
}
