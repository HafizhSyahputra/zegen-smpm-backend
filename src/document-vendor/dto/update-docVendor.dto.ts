import { IsExist } from '@smpm/common/validator/is-exists.validator';
import { IsOptional, IsString, Validate } from 'class-validator';

export class UpdateDocVendorDto {
  @IsOptional()
  @IsString()
  vendor_name?: string;
  @IsOptional()
  @IsString()
  no_perjanjian_kerjasama?: string;
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
  @Validate(IsExist, ['User', 'id'])
  updated_by?: number;
}
