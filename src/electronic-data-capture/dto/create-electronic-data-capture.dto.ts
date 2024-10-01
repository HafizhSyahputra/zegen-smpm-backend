import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateElectronicDataCaptureDto {
  @IsString()
  @IsNotEmpty()
  mid: string;

  @IsString()
  tid: string;

  @IsString()
  @IsOptional()
  brand: string;

  @IsString()
  @IsOptional()
  brand_type: string;

  @IsString()
  @IsOptional()
  region: string;

  @IsString()
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
  status_active: boolean;

  @IsString()
  @IsOptional()
  simcard_provider: string;

  @IsString()
  @IsOptional()
  simcard_number: string;

  @IsString()
  @IsOptional()
  info: string;
}
