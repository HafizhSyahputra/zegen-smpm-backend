// DTO: page-option-user.dto.ts

import { ColumnUser } from '@smpm/common/constants/enum'; // Use ColumnUser if that is correct
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { IsEnumArray } from '@smpm/common/validator/is-enum-array.validator';
import { IsExist } from '@smpm/common/validator/is-exists.validator';
import { IsArray, IsEnum, IsNumber, IsOptional, Validate } from 'class-validator';

export class PageOptionUserDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsEnumArray(ColumnUser, { message: 'Invalid value in search_by' }) // Ensure ColumnUser is correct
  search_by: ColumnUser[];

  @IsOptional()
  @IsEnum(ColumnUser) // Ensure ColumnUser is correct
  order_by: ColumnUser;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Validate(IsExist, ['region', 'id'])
  region_id: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Validate(IsExist, ['vendor', 'id'])
  vendor_id: number[];
}
