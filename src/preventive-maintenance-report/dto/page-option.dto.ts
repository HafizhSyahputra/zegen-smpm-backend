import { ColumnPreventiveMaintenanceReport } from '@smpm/common/constants/enum';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class PageOptionPMReportDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  search_by: ColumnPreventiveMaintenanceReport[];

  @IsOptional()
  @IsEnum(ColumnPreventiveMaintenanceReport)
  order_by: ColumnPreventiveMaintenanceReport;
}
