import { IsExist } from '@smpm/common/validator/is-exists.validator';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
export class CreateReceivedInDto {
  @IsNotEmpty()
  @IsNumber()
  @Validate(IsExist, ['JobOrder', 'id'])
  id_joborder: number;
  @IsNotEmpty()
  @IsNumber()
  @Validate(IsExist, ['EDCTerpasang', 'id'])
  id_edc: number;
  @IsNotEmpty()
  @IsNumber()
  @Validate(IsExist, ['Region', 'id'])
  id_region: number;
  @IsNotEmpty()
  @IsNumber()
  @Validate(IsExist, ['Vendor', 'id'])
  id_vendor: number;
  @IsNotEmpty()
  @IsNumber()
  @Validate(IsExist, ['Merchant', 'id'])
  id_merchant: number;
  @IsNotEmpty()
  @IsString()
  serial_number: string;
  @IsNotEmpty()
  @IsString()
  tid: string;
}