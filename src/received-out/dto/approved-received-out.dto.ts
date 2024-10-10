// src/received-out/dto/approve-received-out.dto.ts

import { IsNumber, IsOptional, IsString, IsIn } from 'class-validator';
import { StatusReceivedOut } from '../../common/constants/enum';

export class ApproveReceivedOutDto {
  @IsOptional()
  @IsNumber()
  approved_by?: number;

  @IsOptional()
  @IsNumber()
  updated_by?: number;

  @IsOptional()
  @IsString()
  @IsIn([StatusReceivedOut.APPROVED])
  status?: string; // Hanya mengizinkan perubahan ke "approved"
}