import { RoleType } from '@smpm/common/constants/enum';
import { IsExist } from '@smpm/common/validator/is-exists.validator';
import { IsUnique } from '@smpm/common/validator/is-unique.validator';
import { Match } from '@smpm/common/validator/match.validator';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Validate,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @Transform(({ value }) => value && parseInt(value))
  @IsNumber()
  // @Validate(IsExist, ['role', 'id'])
  role_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Validate(IsExist, ['region', 'id'])
  @ValidateIf((obj) => obj.role_type == RoleType.WILAYAH)
  region_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Validate(IsExist, ['vendor', 'id'])
  @ValidateIf((obj) => obj.role_type == RoleType.VENDOR)
  vendor_id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @Validate(IsUnique, ['user', 'email', 'Email already exist.'])
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @Match('password', { message: "Password confirmation doesn't match" })
  password_confirmation: number;

  @IsNotEmpty()
  @Validate(IsUnique, ['user', 'npp', 'NPP already exist.'])
  npp: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (!!value ? new Date(value).toISOString() : value))
  dob: Date;

  @IsOptional()
  phone: string;
}
