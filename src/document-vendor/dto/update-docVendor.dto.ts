import { IsExist } from '@smpm/common/validator/is-exists.validator';
import { IsOptional, IsString, Validate } from 'class-validator';

export class UpdateDocVendorDto {
  @IsOptional()
  @IsString()
  edc_brand?: string;
  @IsOptional()
  @IsString()
  edc_type?: string;
  @IsOptional()
  @IsString()
  jo_type?: string;
  @IsOptional()
  @IsString()
  vendor_name?: string;
  @IsOptional()
  @IsString()
  tanggal_perjanjian?: string;
  @IsOptional()
  @IsString()
  file1?: string;
  @IsOptional()
  @IsString()
  file2?: string;
  @IsOptional()  
  @IsString()
  longitude?: string;
  @IsOptional()  
  @IsString()
  latitude?: string;
  @IsOptional()  
  @IsString()
  location?: string;
  @IsOptional()
  @Validate(IsExist, ['User', 'id'])
  updated_by?: number;
}
