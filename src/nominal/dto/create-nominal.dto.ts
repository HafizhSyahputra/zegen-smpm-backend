import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateNominalDto {
  @IsNotEmpty()
  @IsString()
  jenis: string;

  @IsNotEmpty()
  @IsNumber()
  vendor_id: number;

  @IsNotEmpty()
  @IsString()
  nominal: string;

  @IsNotEmpty()
  @IsString()
  tipe: string;
}
