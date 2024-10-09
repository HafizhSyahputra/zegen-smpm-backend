import { IsExist } from "@smpm/common/validator/is-exists.validator";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from "class-validator";

export class CreateDocMerchantDto {
    @IsNotEmpty()
    @IsNumber()
    @Validate(IsExist, ['Merchant', 'id'])
    merchant_id: number;
  
    @IsNotEmpty()
    @IsNumber()
    @Validate(IsExist, ['Region', 'id'])
    region_id: number;
  
    @IsOptional()
    @IsString()
    file1?: string;
  
    @IsOptional()
    @IsString()
    file2?: string;

    @IsString()
    location: string;

    @IsOptional()
    @Validate(IsExist, ['User', 'id'])  
    created_by?: number;
  }
  