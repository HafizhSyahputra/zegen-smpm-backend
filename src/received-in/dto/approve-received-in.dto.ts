// src/received-in/dto/approve-received-in.dto.ts

import { IsNumber, IsOptional, IsString, IsIn } from 'class-validator';

export class ApproveReceivedInDto {
  @IsOptional()
  @IsNumber()
  approved_by?: number;

  @IsOptional()
  @IsNumber()
  updated_by?: number;

  @IsOptional()
  @IsString()
  @IsIn(['approved'])
  status?: string; // Hanya mengizinkan perubahan ke "approved"

  @IsString()
  petugas: string;

  @IsString()
  kondisibarang: string;
}