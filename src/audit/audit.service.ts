import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditTrail } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async create(auditData: {
    Url: string;
    ActionName: string;
    MenuName: string;
    DataBefore: string;
    DataAfter: string;
    UserName: string;
    IpAddress: string;
    ActivityDate: Date;
    Browser: string;
    OS: string;
    AppSource: string;
    created_by: number;
    updated_by: number;
  }) {
    return this.prisma.auditTrail.create({
      data: {
        Url: auditData.Url,
        ActionName: auditData.ActionName,
        MenuName: auditData.MenuName,
        DataBefore: auditData.DataBefore,
        DataAfter: auditData.DataAfter,
        UserName: auditData.UserName,
        IpAddress: auditData.IpAddress,
        ActivityDate: auditData.ActivityDate,
        Browser: auditData.Browser,
        OS: auditData.OS,
        AppSource: auditData.AppSource,
        created_by: auditData.created_by,
        updated_by: auditData.updated_by,
      },
    });
  }

  async getAllLogs(): Promise<AuditTrail[]> {
    return this.prisma.auditTrail.findMany({
      orderBy: { ActivityDate: 'desc' },
      where: {
        deleted_at: null,
      },
    });
  }

  async exportToExcel(res: Response, menuName?: string): Promise<void> {  
    const logs = await this.getAllLogs();  
   
    const filteredLogs = menuName  
      ? logs.filter((log) => log.MenuName === menuName)  
      : logs;  
  
    const workbook = new ExcelJS.Workbook();  
    const worksheet = workbook.addWorksheet('Audit Logs');  
  
    const headerRow = worksheet.addRow([  
      'URL',  
      'Action',  
      'Menu',  
      'User',  
      'Data Before',  
      'Data After',  
      'IP Address',  
      'Date',  
      'Browser',  
      'OS',  
      'App Source',  
    ]);  
  
    headerRow.eachCell((cell) => {  
      cell.fill = {  
        type: 'pattern',  
        pattern: 'solid',  
        fgColor: { argb: 'FF006678' },  
      };  
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };   
      cell.alignment = { vertical: 'middle', horizontal: 'center' }; 
    });  
  
    headerRow.height = 25;
  
    worksheet.getColumn('A').width = 20; // URL  
    worksheet.getColumn('B').width = 15; // Action  
    worksheet.getColumn('C').width = 20; // Menu  
    worksheet.getColumn('D').width = 20; // User  
    worksheet.getColumn('E').width = 30; // Data Before  
    worksheet.getColumn('F').width = 30; // Data After  
    worksheet.getColumn('G').width = 15; // IP Address  
    worksheet.getColumn('H').width = 25; // Date  
    worksheet.getColumn('I').width = 20; // Browser  
    worksheet.getColumn('J').width = 15; // OS  
    worksheet.getColumn('K').width = 15; // App Source  
  
    filteredLogs.forEach((log) => {  
      const row = worksheet.addRow([  
        log.Url,  
        log.ActionName,  
        log.MenuName,  
        log.UserName,  
        log.DataBefore,  
        log.DataAfter,  
        log.IpAddress,  
        log.ActivityDate,  
        log.Browser,  
        log.OS,  
        log.AppSource,  
      ]);  
  
      row.getCell('A').alignment = { vertical: 'middle', horizontal: 'center' }; // URL  
      row.getCell('B').alignment = { vertical: 'middle', horizontal: 'center' }; // Action  
      row.getCell('D').alignment = { vertical: 'middle', horizontal: 'center' }; // User  
      row.getCell('G').alignment = { vertical: 'middle', horizontal: 'center' }; // IP Address  
      row.getCell('H').alignment = { vertical: 'middle', horizontal: 'center' }; // Date  
      row.getCell('I').alignment = { vertical: 'middle', horizontal: 'center' }; // Browser  
      row.getCell('J').alignment = { vertical: 'middle', horizontal: 'center' }; // OS  
      row.getCell('C').alignment = { vertical: 'middle', horizontal: 'center' }; // Menu  
      row.getCell('K').alignment = { vertical: 'middle', horizontal: 'center' }; // App Source  
    });  
  
    res.setHeader(  
      'Content-Type',  
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  
    );  
    res.setHeader(  
      'Content-Disposition',  
      'attachment; filename=audit_logs.xlsx',  
    );  
  
    await workbook.xlsx.write(res);  
    res.end();  
  }  
  
  async exportSystemToExcel(res: Response): Promise<void> {  
    const logs = await this.getAllLogs();  
  
    const filteredLogs = logs.filter((log) => log.MenuName !== 'Autentikasi');  
  
    const workbook = new ExcelJS.Workbook();  
    const worksheet = workbook.addWorksheet('Audit Logs');  
  
    const headerRow = worksheet.addRow([  
      'URL',  
      'Action',  
      'Menu',  
      'User',  
      'Data Before',  
      'Data After',  
      'IP Address',  
      'Date',  
      'Browser',  
      'OS',  
      'App Source',  
    ]);  
  
    headerRow.eachCell((cell) => {  
      cell.fill = {  
        type: 'pattern',  
        pattern: 'solid',  
        fgColor: { argb: 'FF006678' },  
      };  
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };   
      cell.alignment = { vertical: 'middle', horizontal: 'center' }; 
    });  
  
    headerRow.height = 25;
  
    worksheet.getColumn('A').width = 30; // URL  
    worksheet.getColumn('B').width = 32; // Action  
    worksheet.getColumn('C').width = 20; // Menu  
    worksheet.getColumn('D').width = 20; // User  
    worksheet.getColumn('E').width = 30; // Data Before  
    worksheet.getColumn('F').width = 30; // Data After  
    worksheet.getColumn('G').width = 15; // IP Address  
    worksheet.getColumn('H').width = 25; // Date  
    worksheet.getColumn('I').width = 20; // Browser  
    worksheet.getColumn('J').width = 15; // OS  
    worksheet.getColumn('K').width = 15; // App Source  
  
    filteredLogs.forEach((log) => {  
      const row = worksheet.addRow([  
        log.Url,  
        log.ActionName,  
        log.MenuName,  
        log.UserName,  
        log.DataBefore,  
        log.DataAfter,  
        log.IpAddress,  
        log.ActivityDate,  
        log.Browser,  
        log.OS,  
        log.AppSource,  
      ]);  
  
      row.getCell('D').alignment = { vertical: 'middle', horizontal: 'center' }; // User  
      row.getCell('G').alignment = { vertical: 'middle', horizontal: 'center' }; // IP Address  
      row.getCell('H').alignment = { vertical: 'middle', horizontal: 'center' }; // Date  
      row.getCell('I').alignment = { vertical: 'middle', horizontal: 'center' }; // Browser  
      row.getCell('J').alignment = { vertical: 'middle', horizontal: 'center' }; // OS  
      row.getCell('C').alignment = { vertical: 'middle', horizontal: 'center' }; // Menu  
      row.getCell('K').alignment = { vertical: 'middle', horizontal: 'center' }; // App Source  
    });  
  
    res.setHeader(  
      'Content-Type',  
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  
    );  
    res.setHeader(  
      'Content-Disposition',  
      'attachment; filename=audit_logs.xlsx',  
    );  
  
    await workbook.xlsx.write(res);  
    res.end();  
  }
}
