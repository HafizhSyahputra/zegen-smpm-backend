import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SubmitPaymentDto {
  @IsNotEmpty()
  @IsNumber()
  id_payment: number;

  @IsNotEmpty()
  @IsString()
  subject: string;
}