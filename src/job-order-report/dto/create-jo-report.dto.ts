import {
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
  IsIn,
  IsDate,
  Validate,
} from 'class-validator';

export class CreateJobOrderReportDto {
  @IsNotEmpty()
  @IsString()
  job_order_no: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsString()
  status_approve: string;

  @IsNotEmpty()
  @IsString()
  edc_brand: string;

  @IsNotEmpty()
  @IsString()
  edc_brand_type: string;

  @IsNotEmpty()
  @IsString()
  edc_serial_number: string;

  @IsOptional()
  @IsString()
  edc_note?: string;

  @IsOptional()
  @IsString()
  edc_action?: string;
  
  @IsOptional()
  @IsString()
  nominal?: string;

  @IsOptional()
  @IsString()
  sla_penalty?: string;

  @IsNotEmpty()
  @IsString()
  information: string;

  @IsOptional()
  @IsDate()
  arrival_time?: Date;

  @IsOptional()
  @IsDate()
  start_time?: Date;

  @IsOptional()
  @IsDate()
  end_time?: Date;

  @IsOptional()
  @IsString()
  communication_line?: string;

  @IsOptional()
  @IsString()
  direct_line_number?: string;

  @IsOptional()
  @IsString()
  simcard_provider?: string;

  @IsOptional()
  @IsString()
  paper_supply?: string;

  @IsOptional()
  @IsString()
  merchant_pic?: string;

  @IsOptional()
  @IsString()
  merchant_pic_phone?: string;

  @IsOptional()
  @IsString()
  swipe_cash_indication?: string;

  @IsOptional()
  @IsNumber()
  created_by?: number;
}
