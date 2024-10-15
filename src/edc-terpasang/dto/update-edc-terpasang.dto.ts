import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateEDCTerpasangDto } from './create-edc-terpasang.dto';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateEDCTerpasangDto extends PartialType(
  OmitType(CreateEDCTerpasangDto, ['tid'] as const),
) {
  @IsOptional()
  @IsString()
  tid?: string;

  @IsOptional()
  @IsBoolean()
  status_active?: boolean;
}