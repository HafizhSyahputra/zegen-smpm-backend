import { ColumnActivityVendorReport } from '@smpm/common/constants/enum';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class PageOptionActivityVendorReportDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  search_by: ColumnActivityVendorReport[];

  @IsOptional()
  @IsEnum(ColumnActivityVendorReport)
  order_by: ColumnActivityVendorReport;
}
