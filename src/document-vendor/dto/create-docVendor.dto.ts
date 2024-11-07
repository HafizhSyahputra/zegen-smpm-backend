import { IsExist } from '@smpm/common/validator/is-exists.validator';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';

export class CreateDocVendorDto {
  @IsNotEmpty()
  @IsString()
  no_perjanjian_kerjasama: string;
  
  @IsNotEmpty()
  @IsString()
  vendor_name: string;

  @IsNotEmpty()
  @IsString()
  tanggal_perjanjian: string;

  @IsOptional()
  @IsString()
  file1?: string;

  @IsOptional()
  @IsString()
  file2?: string;

  @IsOptional()
  @Validate(IsExist, ['User', 'id'])
  created_by?: number;
  @IsOptional()
  @Validate(IsExist, ['User', 'id'])
  updated_by?: number;
}
