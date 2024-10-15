// src/approve-merchant/dto/update-approve-merchant.dto.ts

import { IsExist } from '@smpm/common/validator/is-exists.validator';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Validate,
} from 'class-validator';

export class UpdateApproveMerchantDto {
  @IsOptional()
  @IsNumber()
  @Validate(IsExist, ['Merchant', 'id'])
  merchant_id?: number;

  @IsOptional()
  @IsString()
  @IsIn(['Add', 'Edit', 'Delete'])
  type?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Waiting', 'Approved', 'Rejected']) 
  status?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  info_remark?: string;

  @IsOptional()
  @IsNumber()
  approved_by?: number;

  @IsOptional()
  @IsNumber()
  rejected_by?: number;

  @IsOptional()
  @IsNumber()
  updated_by?: number;

  @IsOptional()
  @IsDateString()
  updated_at?: Date;
}

export class RejectApproveMerchantDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  info_remark?: string;
}