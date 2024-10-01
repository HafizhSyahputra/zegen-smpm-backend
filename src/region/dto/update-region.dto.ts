import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateRegionDto } from './create-region.dto';

export class UpdateRegionDto extends PartialType(
  OmitType(CreateRegionDto, ['code'] as const),
) {
  @IsOptional()
  @IsString()
  code: string;
}
