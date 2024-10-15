// src/received-out/dto/create-received-out.dto.ts

import { IsExist } from "@smpm/common/validator/is-exists.validator";
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from "class-validator";
import { StatusReceivedOut } from '../../common/constants/enum';

export class CreateReceivedOutDto {
  @IsOptional()
  @IsNumber()
  @Validate(IsExist, ['JobOrder', 'id'])
  id_joborder?: number;

  @IsOptional()
  @IsNumber()
  @Validate(IsExist, ['ElectronicDataCaptureMachine', 'id'])
  id_edc?: number;

  @IsOptional()
  @IsNumber()
  @Validate(IsExist, ['Region', 'id'])
  id_region?: number;

  @IsOptional()
  @IsNumber()
  @Validate(IsExist, ['Vendor', 'id'])
  id_vendor?: number;

  @IsOptional()
  @IsNumber()
  @Validate(IsExist, ['Merchant', 'id'])
  id_merchant?: number;

  @IsOptional()
  @IsString()
  serial_number?: string;

  @IsOptional()
  @IsString()
  tid?: string;

  @IsNotEmpty()
  @IsString()
  @IsIn([StatusReceivedOut.WAITING, StatusReceivedOut.APPROVED, StatusReceivedOut.REJECTED])
  status: string;

  @IsOptional()
  @IsNumber()
  approved_by?: number;

  @IsOptional()
  @IsNumber()
  created_by?: number;

  @IsOptional()
  @IsNumber()
  updated_by?: number;
}