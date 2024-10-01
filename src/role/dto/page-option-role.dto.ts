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
import { Type } from 'class-transformer';
import { ColumnRole, Order } from '@smpm/common/constants/enum'; // Pastikan path ini sesuai

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

  // Jika ada filter tambahan, tambahkan di sini
  @IsOptional()
  @IsEnum(ColumnRole, { each: true })
  type?: ColumnRole[];
}
