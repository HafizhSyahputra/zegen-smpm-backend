import { IsEnumArray } from '@smpm/common/validator/is-enum-array.validator';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { ColumnEDCTerpasang } from '@smpm/common/constants/enum';

export class PageOptionEDCTerpasangDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsEnumArray(ColumnEDCTerpasang)
  search_by: ColumnEDCTerpasang[];

  @IsOptional()
  @IsEnum(ColumnEDCTerpasang)
  order_by: ColumnEDCTerpasang;
}