import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetEdcBrandTypeDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  type?: string;
}