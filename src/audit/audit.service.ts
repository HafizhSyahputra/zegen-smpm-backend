import { Injectable } from '@nestjs/common';  
import { PrismaService } from '../prisma/prisma.service';  
import { PageOptionAuditDto } from './dto/page-options-audit.dto';
import { AuditTrail, Prisma } from '@prisma/client';
import { PageDto } from '@smpm/common/decorator/page.dto';
 import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { ColumnAudit } from '@smpm/common/constants/enum';
import { AuditEntity } from './entities/audit.entity';
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
        deleted_at: null  
      }  
    });  
  }  

  // async getAllLogs(  
  //   pageOptionAuditDto: PageOptionAuditDto,  
  // ): Promise<PageDto<AuditTrail>> {  
  //   const filter: Prisma.AuditTrailWhereInput = {};  
  //   const order: Prisma.AuditTrailOrderByWithRelationInput = {};  

  //   if (pageOptionAuditDto.search && pageOptionAuditDto.search.trim() !== '') {  
  //     if (pageOptionAuditDto.search_by && pageOptionAuditDto.search_by.length > 0) {  
  //       filter.OR = pageOptionAuditDto.search_by.map((column) => ({  
  //         [column]: {  
  //           contains: pageOptionAuditDto.search,  
  //           mode: 'insensitive',  
  //         },  
  //       }));  
  //     } else {  
  //       filter.OR = Object.values(ColumnAudit)  
  //         .filter((column) => column !== ColumnAudit.id)  
  //         .map((column) => ({  
  //           [column]: {  
  //             contains: pageOptionAuditDto.search,  
  //             mode: 'insensitive',  
  //           },  
  //         }));  
  //     }  
  //   }  

  //   filter.deleted_at = null;  

  //   pageOptionAuditDto.order_by  
  //     ? (order[pageOptionAuditDto.order_by] = pageOptionAuditDto.order)  
  //     : (order.updated_at = pageOptionAuditDto.order);  

  //   console.log('Filter:', filter);  
  //   console.log('Order:', order);  
  //   console.log('Skip:', pageOptionAuditDto.skip);  
  //   console.log('Take:', pageOptionAuditDto.take);  

  //   const [data, countAll] = await Promise.all([  
  //     this.prisma.auditTrail.findMany({  
  //       where: filter,  
  //       orderBy: order,  
  //       skip: pageOptionAuditDto.skip,  
  //       take: pageOptionAuditDto.take,  
  //       select: {  
  //         id: true,  
  //         Url: true,  
  //         ActionName: true,  
  //         MenuName: true,  
  //         UserName: true,  
  //         IpAddress: true,  
  //         ActivityDate: true,  
  //         Browser: true,  
  //         OS: true,  
  //         AppSource: true,  
  //         created_at: true,  
  //         updated_at: true,  
  //       },  
  //     }),  
  //     this.prisma.auditTrail.count({ where: filter }),  
  //   ]);  

  //   console.log('Raw data from database:', data);  
  //   console.log('Total count:', countAll);  

  //   const pageMetaDto = new PageMetaDto({  
  //     itemCount: countAll,  
  //     pageOptionsDto: pageOptionAuditDto,  
  //   });  

  //   return new PageDto(data, pageMetaDto);  
  // }  
}