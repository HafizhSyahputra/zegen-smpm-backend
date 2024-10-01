import { IsExist } from '@smpm/common/validator/is-exists.validator';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateActivityJobOrderDto {
  @IsNotEmpty()
  @IsString()
  @Validate(IsExist, ['JobOrder', 'no'])
  no_jo: string;

  @IsNotEmpty()
  @IsIn(['Done', 'Cancel'])
  status: 'Done' | 'Cancel';

  @IsNotEmpty()
  @IsString()
  @ValidateIf((obj) => obj.status == 'Done')
  edc_brand: string;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((obj) => obj.status == 'Done')
  edc_brand_type: string;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((obj) => obj.status == 'Done')
  edc_serial_number: string;

  @IsOptional()
  edc_note: string;

  @IsOptional()
  edc_action: string;

  @IsOptional()
  @IsDateString()
  arrival_time: Date;

  @IsOptional()
  @IsDateString()
  start_time: Date;

  @IsOptional()
  @IsDateString()
  end_time: Date;

  @IsOptional()
  communication_line: string;

  @IsOptional()
  direct_line_number: string;

  @IsOptional()
  simcard_provider: string;

  @IsOptional()
  paper_supply: string;

  @IsOptional()
  merchant_pic: string;

  @IsOptional()
  merchant_pic_phone: string;

  @IsOptional()
  swipe_cash_indication: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobOrderProduct)
  products: JobOrderProduct[];

  @IsOptional()
  @IsArray()
  edc_dongle_equipment: string[];

  @IsOptional()
  @IsArray()
  material_promo: string[];

  @IsOptional()
  @IsArray()
  material_training: string[];

  @IsNotEmpty()
  @IsString()
  information: string;

  @IsOptional()
  evidence: File[];

  @IsOptional()
  optional: File[];
}

class JobOrderProduct {
  @IsNotEmpty()
  @IsString()
  product: string;

  @IsNotEmpty()
  @IsString()
  serial_number: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  action: string;
}
