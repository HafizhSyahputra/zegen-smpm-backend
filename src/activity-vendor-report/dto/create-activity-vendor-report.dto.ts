import {
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
  IsIn,
  IsDate,
  Validate,
} from 'class-validator';

export class CreateActivityVendorReportDto {
  @IsNotEmpty()
  @IsString()
  job_order_no: string;

  @IsNotEmpty()
  @IsNumber()
  vendor_id: string;

  @IsOptional()
  @IsString()
  nominal?: string;

  @IsNotEmpty()
  @IsString()
  mid: string;

  @IsNotEmpty()
  @IsString()
  tid: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsString()
  jenis: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  petugas: string;

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

  @IsNotEmpty()
  @IsString()
  information: string;

  @IsOptional()
  @IsString()
  cancel_reason: string;

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
