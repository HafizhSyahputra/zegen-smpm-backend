import { IsString } from 'class-validator';

export class GetMerchantQuery {
  @IsString()
  status: string;
}
