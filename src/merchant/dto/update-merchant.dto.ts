import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateMerchantDto } from './create-merchant.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateMerchantDto extends PartialType(OmitType(CreateMerchantDto, ['mid'] as const)) {
    @IsOptional()
    @IsNumber()
    id?: number;
    
}