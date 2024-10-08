
import { IsExist } from '@smpm/common/validator/is-exists.validator';
 import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsIn,
  IsDateString,
  Validate,
} from 'class-validator';

export class UpdateApprovedDto {
  @IsOptional()
  @IsNumber()
  @Validate(IsExist, ['JobOrder', 'id'])
  id_jobOrder?: number;

  @IsOptional()
  @IsNumber()
  @Validate(IsExist, ['Vendor', 'id'])
  vendor_id?: number;

  @IsOptional()
  @IsNumber()
  @Validate(IsExist, ['Region', 'id'])
  region_id?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  info_remark?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Waiting', 'Approved', 'Rejected']) 
  status?: string;

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

export class RejectDto{
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  info_remark?: string;
}