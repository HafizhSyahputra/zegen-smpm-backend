import { IsUnique } from '@smpm/common/validator/is-unique.validator';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from 'class-validator';

export class CreateRegionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  region_group: number;

  @IsNotEmpty()
  @Validate(IsUnique, ['region', 'code', 'Region code already exist.'])
  code: string;

  @IsOptional()
  description?: string;
}
