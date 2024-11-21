// create-berita-acara.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateBeritaAcaraDto {
    @IsNotEmpty()
    @IsNumber()
    id_vendor: number;

    @IsOptional()
    @IsString()
    path_file?: string;

    @IsOptional()
    @IsNumber()
    job_order_ids?: number;

    @IsOptional()
    @IsNumber()
    job_order_report_ids?: number;

    @IsOptional()
    @IsDateString()
    tgl_submit?: Date;


    @IsOptional()
    @IsString()
    note?: string;

    @IsNotEmpty()
    @IsString()
    status: string;

    @IsOptional()
    @IsString()
    subject?: string;

    @IsOptional()
    @IsString()
    harga_total?: string;
}