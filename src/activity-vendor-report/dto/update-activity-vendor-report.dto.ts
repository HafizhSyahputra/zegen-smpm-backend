import { IsOptional, IsString, IsNumber, IsDate } from "class-validator";  

export class UpdateActivityVendorReportDto {  
    @IsOptional()  
    @IsString()  
    job_order_no: string; 

    @IsOptional()  
    @IsNumber()  
    vendor_id: string; 

    @IsOptional()  
    @IsString()  
    nominal: string;    
    
    @IsOptional()  
    @IsString()  
    mid: string;  
    
    @IsOptional()  
    @IsString()  
    tid: string;  

    @IsOptional()  
    @IsString()  
    status: string;  
    
    @IsOptional()  
    @IsString()  
    jenis: string;  
    
    @IsOptional()  
    @IsString()  
    description: string;  
  
    @IsOptional()  
    @IsNumber()  
    amount: number;  
    
    @IsOptional()  
    @IsString()  
    petugas: string;  

    @IsOptional()  
    @IsString()  
    edc_brand?: string;  

    @IsOptional()  
    @IsString()  
    edc_brand_type?: string;  

    @IsOptional()  
    @IsString()  
    edc_serial_number?: string;  

    @IsOptional()  
    @IsString()  
    edc_note?: string;  

    @IsOptional()  
    @IsString()  
    edc_action?: string;  

    @IsOptional()  
    @IsString()  
    information?: string;  

    @IsOptional()  
    @IsDate()  
    arrival_time?: Date;  

    @IsOptional()  
    @IsDate()  
    start_time?: Date;  

    @IsOptional()  
    @IsDate()  
    end_time?: Date;  

    @IsOptional()  
    @IsString()  
    communication_line?: string;  

    @IsOptional()  
    @IsString()  
    direct_line_number?: string;  

    @IsOptional()  
    @IsString()  
    simcard_provider?: string;  

    @IsOptional()  
    @IsString()  
    paper_supply?: string;  

    @IsOptional()  
    @IsString()  
    merchant_pic?: string;  

    @IsOptional()  
    @IsString()  
    merchant_pic_phone?: string;  

    @IsOptional()  
    @IsString()  
    swipe_cash_indication?: string;  

    @IsOptional()  
    @IsNumber()  
    updated_by?: number;  
}