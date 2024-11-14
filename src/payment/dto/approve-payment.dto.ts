// src/payment/dto/approve-payment.dto.ts
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ApprovePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  id_payment: number;

  @IsNotEmpty()
  @IsIn(['Approved', 'Rejected'])
  status: 'Approved' | 'Rejected';

  @IsOptional()
  @IsString()
  reason?: string;
}