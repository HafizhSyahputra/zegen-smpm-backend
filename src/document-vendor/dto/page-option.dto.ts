 import { ColumnDocVendor } from '@smpm/common/constants/enum';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
 import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class PageOptionDocVendorDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  search_by: ColumnDocVendor[];

  @IsOptional()
  @IsEnum(ColumnDocVendor)
  order_by: ColumnDocVendor;
}
