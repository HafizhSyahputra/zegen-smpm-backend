import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateNominalDto {
  @IsOptional()
  @IsString()
  jenis?: string;

  @IsOptional()
  @IsString()
  nominal?: string;

  @IsOptional()
  @IsNumber()
  vendor_id?: number;

  @IsOptional()
  @IsString()
  tipe?: string;
}
