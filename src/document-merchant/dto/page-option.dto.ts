import { ColumnApproved, ColumntDocMerchant } from '@smpm/common/constants/enum';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { IsEnumArray } from '@smpm/common/validator/is-enum-array.validator';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class PageOptionDocMerchantDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  search_by: ColumntDocMerchant[];

  @IsOptional()
  @IsEnum(ColumntDocMerchant)
  order_by: ColumntDocMerchant;
}
