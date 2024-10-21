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
import { ActivityVendorReportService } from './activity-vendor-report.service';
import { ActivityVendorReportEntity } from './entities/activity-vendor-report.entity';
import { PageOptionActivityVendorReportDto } from './dto/page-option.dto';
   
  @UseGuards(AccessTokenGuard)
  @Controller('activity-vendor-report')
  export class ActivityVendorReportController {
    prisma: any;
    constructor(private readonly activityVendorReportService: ActivityVendorReportService) {}
  
    @Get()
    async findAll(
      @Query() pageOptionActivityVendorReportDto: PageOptionActivityVendorReportDto,
    ): Promise<PageDto<ActivityVendorReportEntity>> {
      const data = await this.activityVendorReportService.findAll(
        pageOptionActivityVendorReportDto,
      );
      data.data = data.data.map(
        (item) =>
          new ActivityVendorReportEntity({
            ...item,
          }),
      );
      return data;
    }
  
    @Get(':id')
    async findOne(@Param() param: ParamIdDto): Promise<ActivityVendorReportEntity> {
      try {
          const find = await this.activityVendorReportService.findOne(param.id);  
          console.log('Fetched ActivityVendorReport:', JSON.stringify(find, null, 2));
        if (!find) throw new BadRequestException('Data not found.');
        return new ActivityVendorReportEntity(find);
      } catch (error) {
        console.error('Error fetching ActivityVendorReport:', error);
      }
    }
  }
  