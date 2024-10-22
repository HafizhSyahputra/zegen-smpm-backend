import { ColumnNominal } from '@smpm/common/constants/enum';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
 import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class PageOptionNominalDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  search_by: ColumnNominal[];

  @IsOptional()
  @IsEnum(ColumnNominal)
  order_by: ColumnNominal;
}
