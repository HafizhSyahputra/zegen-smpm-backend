import { ColumnSLA } from '@smpm/common/constants/enum';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { IsEnumArray } from '@smpm/common/validator/is-enum-array.validator';
import { IsArray, IsEnum, IsOptional } from 'class-validator';

export class PageOptionSLADto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsEnumArray(ColumnSLA)
  search_by: ColumnSLA[];

  @IsOptional()
  @IsEnum(ColumnSLA)
  order_by: ColumnSLA;
}
