// src/role/dto/page-option-role.dto.ts

import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';
import { ColumnRole, Order } from '@smpm/common/constants/enum';

export class PageOptionRoleDto extends PageOptionsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(ColumnRole, { each: true })
  search_by?: ColumnRole[];

  @IsOptional()
  @IsEnum(Order)
  order?: Order;

  @IsOptional()
  @IsEnum(ColumnRole)
  order_by?: ColumnRole;

  @IsOptional()
  @IsEnum(ColumnRole, { each: true })
  type?: ColumnRole[];
}
