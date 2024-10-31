// src/electronic-data-capture/dto/get-electronic-data-capture.dto.ts

import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
    IsArray,
    ArrayNotEmpty,
    ArrayUnique,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
  
  export class GetElectronicDataCaptureDto extends PageOptionsDto {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayNotEmpty()
    simcard_provider?: string[];
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayNotEmpty()
    region?: string[];
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayNotEmpty()
    status_owner?: string[];
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayNotEmpty()
    brand?: string[];
  
    @IsOptional()
    @IsArray()
    @Type(() => Number)
    @IsNumber({}, { each: true })
    @ArrayNotEmpty()
    @ArrayUnique()
    merchant_id?: number[];
  
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean) // Ensures conversion to boolean
    status_active?: boolean;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayNotEmpty()
    status_edc?: string[];
  }