import { ColumnVendor } from '@smpm/common/constants/enum';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { IsEnumArray } from '@smpm/common/validator/is-enum-array.validator';
import { IsArray, IsEnum, IsOptional } from 'class-validator';

export class PageOptionVendorDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsEnumArray(ColumnVendor)
  search_by: ColumnVendor[];

  @IsOptional()
  @IsEnum(ColumnVendor)
  order_by: ColumnVendor;
}
