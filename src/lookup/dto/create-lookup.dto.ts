// src/look-up/dto/create-look-up.dto.ts

import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateLookUpDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsInt()
  created_by?: number;

  @IsOptional()
  @IsInt()
  updated_by?: number;
}