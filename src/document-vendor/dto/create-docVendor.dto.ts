import { IsExist } from "@smpm/common/validator/is-exists.validator";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from "class-validator";

export class CreateDocVendorDto {
    @IsNotEmpty()
    @IsNumber()
    @Validate(IsExist, ['JobOrder', 'no'])
    job_order_no: string;
  
    @IsNotEmpty()
    @IsNumber()
    @Validate(IsExist, ['Vendor', 'id'])
    vendor_id: number;
  
    @IsNotEmpty()
    @IsNumber()
    @Validate(IsExist, ['Region', 'id'])
    region_id: number;
  
    @IsNotEmpty()
    @IsNumber()
    @Validate(IsExist, ['Merchant', 'mid'])
    mid: string;
    
    @IsNotEmpty()
    @IsNumber()
    @Validate(IsExist, ['ElectronicDataCaptureMachine', 'tid'])
    tid: string;
  
    @IsOptional()
    @IsString()
    file1?: string;
  
    @IsOptional()
    @IsString()
    file2?: string;

    @IsString()
    location?: string;

    @IsOptional()
    @Validate(IsExist, ['User', 'id'])  
    created_by?: number;
    @IsOptional()
    @Validate(IsExist, ['User', 'id'])  
    updated_by?: number;
  }
  