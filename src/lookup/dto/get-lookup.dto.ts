// src/look-up/dto/get-look-up-query.dto.ts

import { IsOptional, IsString, IsInt } from 'class-validator';

export class GetLookUpQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  created_by?: number;

  @IsOptional()
  @IsInt()
  updated_by?: number;
}