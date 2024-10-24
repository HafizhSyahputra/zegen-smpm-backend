import { IsUnique } from '@smpm/common/validator/is-unique.validator';
import { IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';

export class CreateVendorDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  jenis: string;

  @IsNotEmpty()
  @Validate(IsUnique, ['vendor', 'code', 'Vendor code already exist.'])
  code: string;

  @IsOptional()
  description?: string;
}
