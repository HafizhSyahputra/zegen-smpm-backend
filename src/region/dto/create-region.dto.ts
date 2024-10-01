import { IsUnique } from '@smpm/common/validator/is-unique.validator';
import { IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';

export class CreateRegionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @Validate(IsUnique, ['region', 'code', 'Region code already exist.'])
  code: string;

  @IsOptional()
  description?: string;
}
