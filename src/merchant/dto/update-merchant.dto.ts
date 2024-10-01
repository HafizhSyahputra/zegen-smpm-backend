import { PartialType } from '@nestjs/mapped-types';
import { CreateMerchantDto } from './create-merchant.dto';
import { IsNumber } from 'class-validator';

export class UpdateMerchantDto extends PartialType(CreateMerchantDto) {
  @IsNumber()
  id: number;
}
