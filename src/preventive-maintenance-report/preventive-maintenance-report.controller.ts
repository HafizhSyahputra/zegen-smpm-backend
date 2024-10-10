import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
    BadRequestException,
  } from '@nestjs/common';
   import { PageDto } from '@smpm/common/decorator/page.dto';
  import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
  import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { PreventiveMaintenanceReportService } from './preventive-maintenance-report.service';
import { PageOptionPMReportDto } from './dto/page-option.dto';
import { PreventiveMaintenanceReportEntity } from './entities/pm-report.entity';
    
  @UseGuards(AccessTokenGuard)
  @Controller('preventive-maintenance-report')
  export class PreventiveMaintenanceReportController {
    prisma: any;
    constructor(private readonly preventiveMaintenanceReportService: PreventiveMaintenanceReportService) {}
  
    @Get()
    async findAll(
      @Query() pageOptionPMReportDto: PageOptionPMReportDto,
    ): Promise<PageDto<PreventiveMaintenanceReportEntity>> {
      const data = await this.preventiveMaintenanceReportService.findAll(
        pageOptionPMReportDto,
      );
      data.data = data.data.map(
        (item) =>
          new PreventiveMaintenanceReportEntity({
            ...item,
          }),
      );
      return data;
    }
  
    @Get(':id')
    async findOne(@Param() param: ParamIdDto): Promise<PreventiveMaintenanceReportEntity> {
      try {
          const find = await this.preventiveMaintenanceReportService.findOne(param.id);  
          console.log('Fetched PM Report:', JSON.stringify(find, null, 2));
        if (!find) throw new BadRequestException('Data not found.');
        return new PreventiveMaintenanceReportEntity(find);
      } catch (error) {
        console.error('Error fetching PM Report:', error);
      }
    }
  }
  