import {   
    IsOptional,   
    IsString,   
    IsInt,   
    IsPositive,  
    IsDate,  
  } from 'class-validator';  
  import { Type } from 'class-transformer';  
  
  export class UpdateSlaDto {  
    
    @IsOptional()  
    @IsString()  
    job_order_no?: string;  
  
    @IsOptional()  
    @IsInt()  
    @IsPositive()  
    vendor_id?: number;  
  
    @IsOptional()  
    @IsInt()  
    @IsPositive()  
    region_id?: number;  
  
    @IsOptional()  
    @IsInt()  
    @IsPositive()  
    region_group_id?: number;  
  
    @IsOptional()  
    @IsString()  
    tid?: string;  
  
    @IsOptional()  
    @IsString()  
    mid?: string;  
  
    @IsOptional()  
    @IsInt()  
    @IsPositive()  
    sla_region?: number;  
  
    @IsOptional()  
    @Type(() => Date)  
    @IsDate()  
    open_time?: Date;  
  
    @IsOptional()  
    @Type(() => Date)  
    @IsDate()  
    target_time?: Date;  
  
    @IsOptional()  
    @IsString()  
    status_sla?: string;    
  
    @IsOptional()  
    @Type(() => Date)  
    @IsDate()  
    solved_time?: Date;  
  
    @IsOptional()  
    @IsString()  
    status?: string;  
  
    @IsOptional()  
    @IsInt()  
    @IsPositive()  
    created_by?: number;  
  
    @IsOptional()  
    @IsInt()  
    @IsPositive()  
    updated_by?: number;  
  }