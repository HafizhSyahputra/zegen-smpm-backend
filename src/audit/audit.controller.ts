import { Controller, Get, Query } from '@nestjs/common';  
import { AuditService } from './audit.service';  
import { PageDto } from '@smpm/common/decorator/page.dto';  
import { AuditEntity } from './entities/audit.entity';  
import { transformEntity } from '@smpm/common/transformer/entity.transformer';  
import { PageOptionAuditDto } from './dto/page-options-audit.dto';  
import { AuditTrail } from '@prisma/client';

@Controller('audit')  
export class AuditController {  
  constructor(private readonly auditService: AuditService) {}  

  // @Get()  
  // async getAllLogs(@Query() pageOptionAuditDto: PageOptionAuditDto): Promise<PageDto<AuditEntity>> {  
  //   const data = await this.auditService.getAllLogs(pageOptionAuditDto);  
  //   console.log('Data before transformation:', data.data);  
  //   const transformedData = transformEntity(AuditEntity, data.data);  
  //   console.log('Data after transformation:', transformedData);  
  //   return new PageDto(transformedData, data.meta);  
  // }  

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
}