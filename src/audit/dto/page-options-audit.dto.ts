import { ColumnAudit } from '@smpm/common/constants/enum';  
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';  
import { IsEnumArray } from '@smpm/common/validator/is-enum-array.validator';  
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';  
import { Transform } from 'class-transformer';  

export class PageOptionAuditDto extends PageOptionsDto {  
  @IsOptional()  
  @IsString()  
  @Transform(({ value }) => value?.trim())  
  search?: string;  

  @IsOptional()  
  @IsArray()  
  @IsEnumArray(ColumnAudit)  
  search_by?: ColumnAudit[];  

  @IsOptional()  
  @IsEnum(ColumnAudit)  
  order_by?: ColumnAudit;  
}