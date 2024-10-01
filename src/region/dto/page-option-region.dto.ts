import { ColumnRegion } from '@smpm/common/constants/enum';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { IsEnumArray } from '@smpm/common/validator/is-enum-array.validator';
import { IsArray, IsEnum, IsOptional } from 'class-validator';

export class PageOptionRegionDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsEnumArray(ColumnRegion)
  search_by: ColumnRegion[];

  @IsOptional()
  @IsEnum(ColumnRegion)
  order_by: ColumnRegion;
}
