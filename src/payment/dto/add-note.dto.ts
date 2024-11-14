// src/payment/dto/add-note.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddNoteDto {
  @IsNotEmpty()
  @IsNumber()
  id_payment: number;

  @IsNotEmpty()
  @IsString()
  note: string;
}