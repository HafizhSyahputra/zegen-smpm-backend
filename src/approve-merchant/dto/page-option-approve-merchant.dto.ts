// src/approve-merchant/dto/page-option-approve-merchant.dto.ts
import { ApprovalType } from '../types/approve-merchant.types';
import { ColumnApprovedMerchant } from '@smpm/common/constants/enum';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PageOptionApproveMerchantDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  search_by: ColumnApprovedMerchant[];

  @IsOptional()
  @IsString()
  order_by: ColumnApprovedMerchant;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsString()
  @IsIn(['Add', 'Edit', 'Delete'])
  type?: ApprovalType;
}