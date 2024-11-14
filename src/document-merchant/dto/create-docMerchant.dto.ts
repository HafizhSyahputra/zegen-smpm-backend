import { IsExist } from "@smpm/common/validator/is-exists.validator";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from "class-validator";

export class CreateDocMerchantDto {

    @IsNotEmpty()
    @IsString()
    merchant_name: string;
    
    @IsOptional()
    @IsString()
    file1?: string;
  
    @IsOptional()
    @IsString()
    file2?: string;

    @IsString()
    longitude: string;
    
    @IsString()
    latitude: string;

    @IsString()
    location: string;

    @IsOptional()
    @Validate(IsExist, ['User', 'id'])  
    created_by?: number;
    @IsOptional()
    @Validate(IsExist, ['User', 'id'])  
    updated_by?: number;
  }
  