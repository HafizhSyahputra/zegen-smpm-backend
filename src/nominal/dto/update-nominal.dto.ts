import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNominalDto {
  @IsNotEmpty()
  @IsString()
  jenis: string;

  @IsNotEmpty()
  @IsString()
  nominal: string;

  @IsNotEmpty()
  @IsString()
  tipe: string;
}
