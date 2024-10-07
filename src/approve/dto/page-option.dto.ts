import { ColumnApproved } from '@smpm/common/constants/enum';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { IsEnumArray } from '@smpm/common/validator/is-enum-array.validator';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class PageOptionApproveDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  search_by: ColumnApproved[];

  @IsOptional()
  @IsEnum(ColumnApproved)
  order_by: ColumnApproved;
}
