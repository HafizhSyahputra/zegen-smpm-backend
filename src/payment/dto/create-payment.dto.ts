// src/payment/dto/create-payment.dto.ts

import { IsInt, IsOptional, IsString, IsNotEmpty, isString } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  id_vendor: number;

  @IsOptional()
  @IsString()
  job_order_ids?: string;

  @IsOptional()
  @IsString()
  job_order_report_ids?: string;

  @IsNotEmpty()
  @IsString()
  invoice_code: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  harga_total?: string;

  @IsOptional()
  @IsInt()
  created_by?: number;

  
  @IsOptional()
  @IsString()
  status?: string; // Tambahkan properti ini

  @IsOptional()
  @IsInt()
  updated_by?: number;
}