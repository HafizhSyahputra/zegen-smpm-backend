import { IsExist } from "@smpm/common/validator/is-exists.validator";  
import { IsOptional, IsString, Validate } from "class-validator";  

export class UpdateDocMerchantDto {  
    @IsOptional()  
    @IsString()  
    file1?: string;  
  
    @IsOptional()  
    @IsString()  
    file2?: string;  

    @IsOptional()  
    @Validate(IsExist, ['User', 'id'])  
    updated_by?: number;  
}