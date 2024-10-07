import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JobOrderReportService } from './job-order-report.service';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { PageOptionJOReportDto } from './dto/page-option.dto';
import { JobOrderReportEntity } from './entities/joReport.entity';

@UseGuards(AccessTokenGuard)
@Controller('job-order-report')
export class JobOrderReportController {
  prisma: any;
  constructor(private readonly jobOrderReportService: JobOrderReportService) {}

  @Get()
  async findAll(
    @Query() pageOptionJOReportDto: PageOptionJOReportDto,
  ): Promise<PageDto<JobOrderReportEntity>> {
    const data = await this.jobOrderReportService.findAll(
      pageOptionJOReportDto,
    );
    data.data = data.data.map(
      (item) =>
        new JobOrderReportEntity({
          ...item,
        }),
    );
    return data;
  }

  @Get(':id')
  async findOne(@Param() param: ParamIdDto): Promise<JobOrderReportEntity> {
    try {
        const find = await this.jobOrderReportService.findOne(param.id);  
        console.log('Fetched Job Order Report:', JSON.stringify(find, null, 2));
      if (!find) throw new BadRequestException('Data not found.');
      return new JobOrderReportEntity(find);
    } catch (error) {
      console.error('Error fetching Job Order Report:', error);
    }
  }
}
