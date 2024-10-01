import { RoleType } from '@smpm/common/constants/enum';
import { IsUnique } from '@smpm/common/validator/is-unique.validator';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @Validate(IsUnique, ['role', 'name', 'Role name already exist.'])
  name: string;

  @IsNotEmpty()
  @IsString()
  @Validate(IsUnique, ['role', 'code', 'Role code already exist.'])
  code: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(RoleType)
  type: RoleType;

  @IsOptional()
  @IsString()
  description: string;
}
