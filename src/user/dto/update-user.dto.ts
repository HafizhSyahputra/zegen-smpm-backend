import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';
import { Match } from '@smpm/common/validator/match.validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, [
    'email',
    'npp',
    'password',
    'password_confirmation',
  ] as const),
) {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  npp: string;

  @IsOptional()
  password: string;

  @IsNotEmpty()
  @Match('password', { message: "Password confirmation doesn't match" })
  @ValidateIf((obj) => obj.hasOwnProperty('password'))
  password_confirmation: number;
}
