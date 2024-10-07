import { ColumnJobOrderReport } from '@smpm/common/constants/enum';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class PageOptionJOReportDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  search_by: ColumnJobOrderReport[];

  @IsOptional()
  @IsEnum(ColumnJobOrderReport)
  order_by: ColumnJobOrderReport;
}
