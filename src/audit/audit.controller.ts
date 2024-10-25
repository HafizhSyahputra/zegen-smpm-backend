import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';  
import { AuditService } from './audit.service';  
import { AuditTrail } from '@prisma/client';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { Response } from 'express';  
@UseGuards(AccessTokenGuard)
@Controller('audit')  
export class AuditController {  
  constructor(private readonly auditService: AuditService) {}  
  @Get('all')  
  async getAllLogs(): Promise<{ status: { code: number; description: string }; result: AuditTrail[] }> {  
    try {  
      const data = await this.auditService.getAllLogs();  
      return {  
        status: {  
          code: 200,  
          description: "OK"  
        },  
        result: data  
      };  
    } catch (error) {  
      console.error('Error fetching audit logs:', error);  
      return {  
        status: {  
          code: 500,  
          description: "Internal Server Error"  
        },  
        result: []  
      };  
    }  
  }  
  
  @Get('export')  
  async exportToExcel(@Res() res: Response, @Query('menuName') menuName?: string): Promise<void> {  
    try {  
      await this.auditService.exportToExcel(res, menuName);  
    } catch (error) {  
      console.error('Error exporting audit logs:', error);  
      res.status(500).send('Internal Server Error');  
    }  
  }  
  @Get('SystemExport')  
  async exportSystemToExcel(@Res() res: Response): Promise<void> {  
    try {  
      await this.auditService.exportSystemToExcel(res);  
    } catch (error) {  
      console.error('Error exporting audit logs:', error);  
      res.status(500).send('Internal Server Error');  
    }  
  }  
}