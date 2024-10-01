import { IsNotEmpty, IsString } from 'class-validator';

export class GetEdcBrandTypeDto {
  @IsNotEmpty()
  @IsString()
  brand: string;
}
