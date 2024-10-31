// src/electronic-data-capture/dto/create-electronic-data-capture.dto.ts

import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateElectronicDataCaptureDto {
  @IsNumber()
  @IsNotEmpty()
  owner_id: number;

  @IsString()
  @IsNotEmpty()
  mid: string;

  @IsString()
  @IsNotEmpty()
  tid: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  brand_type: string;

  @IsString()
  @IsOptional()
  region: string;

  @IsString()
  @IsNotEmpty()
  serial_number: string;

  @IsString()
  @IsOptional()
  status_owner: string;

  @IsString()
  @IsOptional()
  status_owner_desc: string;

  @IsString()
  @IsOptional()
  status_machine: string;

  @IsString()
  @IsOptional()
  status_machine_desc: string;

  @IsBoolean()
  @IsNotEmpty()
  status_active: boolean;

  @IsString()
  @IsOptional()
  simcard_provider: string;

  @IsString()
  @IsOptional()
  simcard_number: string;

  @IsString()
  @IsOptional()
  status_edc: string;

  @IsString()
  @IsOptional()
  info: string;

  @IsNumber()
  @IsOptional()
  created_by?: number;
}