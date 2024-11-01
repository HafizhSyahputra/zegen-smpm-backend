import { IsOptional, IsString } from 'class-validator';

export class UpdateNominalDto {
  @IsOptional()
  @IsString()
  jenis?: string;

  @IsOptional()
  @IsString()
  nominal?: string;

  @IsOptional()
  @IsString()
  vendor_id?: number;

  @IsOptional()
  @IsString()
  tipe?: string;
}
