import { IsExist } from "@smpm/common/validator/is-exists.validator";
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from "class-validator";

export class CreateApproveDto {
    @IsNotEmpty()
    @IsNumber()
    @Validate(IsExist, ['JobOrder', 'id'])
    id_jobOrder: number;
  
    @IsNotEmpty()
    @IsNumber()
    @Validate(IsExist, ['Vendor', 'id'])
    vendor_id: number;
  
    @IsNotEmpty()
    @IsNumber()
    @Validate(IsExist, ['Region', 'id'])
    region_id: number;
  
    @IsOptional()
    @IsString()
    reason?: string;
  
    @IsOptional()
    @IsString()
    info_remark?: string;
  
    @IsNotEmpty()
    @IsString()
    @IsIn(['Waiting', 'Approved', 'Rejected']) 
    status: string;
  
    @IsOptional()
    @IsNumber()
    approved_by?: number;
  
    @IsOptional()
    @IsNumber()
    rejected_by?: number;
  
    @IsOptional()
    @IsNumber()
    created_by?: number;
  
    @IsOptional()
    @IsNumber()
    updated_by?: number;

  }
  