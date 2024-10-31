
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProviderSimcardDto {
  @IsString()
  @IsNotEmpty()
  name_provider: string;
}