import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsBoolean,
    Validate,
  } from 'class-validator';
  import { IsUnique } from '@smpm/common/validator/is-unique.validator';
  
  export class CreateEDCTerpasangDto {
    @IsOptional()
    owner_id?: number;
  
    @IsOptional()
    merchant_id?: number;
  
    @IsNotEmpty()
    @IsString()
    mid: string;
  
    @IsNotEmpty()
    @IsString()
    @Validate(IsUnique, ['EDCTerpasang', 'tid', 'TID sudah ada.'])
    tid: string;
  
    @IsNotEmpty()
    @IsString()
    brand: string;
  
    @IsNotEmpty()
    @IsString()
    brand_type: string;
  
    @IsNotEmpty()
    @IsString()
    serial_number: string;
  
    @IsNotEmpty()
    @IsString()
    status_owner: string;
  
    @IsOptional()
    @IsString()
    status_owner_desc?: string;
  
    @IsNotEmpty()
    @IsString()
    status_machine: string;
  
    @IsOptional()
    @IsString()
    status_machine_desc?: string;
  
    @IsNotEmpty()
    @IsBoolean()
    status_active: boolean;
  
    @IsOptional()
    @IsString()
    simcard_provider?: string;
  
    @IsOptional()
    @IsString()
    simcard_number?: string;
  
    @IsOptional()
    @IsString()
    info?: string;
  
    @IsOptional()
    @IsString()
    region?: string;
  }
  