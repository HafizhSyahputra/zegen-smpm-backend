// src/merchant/dto/create-merchant.dto.ts

import { IsString, IsNumber, IsOptional } from 'class-validator';  
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMerchantDto {  
  @IsNumber()  
  region_id: number;  

  @IsString()  
  mid: string;  

  @IsString()  
  name: string;  

  @IsString()  
  category: string;  

  @IsString()  
  customer_name: string;  

  @IsString()  
  @IsOptional()
  telephone?: string;  

  @IsString()  
  pic: string;  

  @IsString()  
  phone1: string;  

  @IsString()  
  @IsOptional()
  phone2?: string;  

  @IsString()  
  address1: string;  

  @IsString()  
  address2: string;  

  @IsString()  
  address3: string;  

  @IsString()  
  address4: string;  

  @IsOptional()  
  @IsString()  
  district?: string;  

  @IsOptional()  
  @IsString()  
  subdistrict?: string;  

  @IsOptional()  
  @IsString()  
  city?: string;  

  @IsOptional()  
  @IsString()  
  province?: string;  

  @IsString()  
  postal_code: string;  

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ default: 'waiting' })
  status: string = 'waiting';

  @IsOptional()  
  @IsNumber()  
  created_by?: number;  

  @IsOptional()  
  @IsNumber()  
  updated_by?: number;  
}