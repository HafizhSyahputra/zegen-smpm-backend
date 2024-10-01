import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateVendorDto } from './create-vendor.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateVendorDto extends PartialType(
  OmitType(CreateVendorDto, ['code'] as const),
) {
  @IsOptional()
  @IsString()
  code: string;
}
