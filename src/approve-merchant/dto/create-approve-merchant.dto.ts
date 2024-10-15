// src/approve-merchant/dto/create-approve-merchant.dto.ts

import { IsExist } from "@smpm/common/validator/is-exists.validator";
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from "class-validator";

export class CreateApproveMerchantDto {
    @IsOptional()
    @IsNumber()
    @Validate(IsExist, ['Merchant', 'id'])
    merchant_id?: number;

    @IsNotEmpty()
    @IsString()
    @IsIn(['Add', 'Edit', 'Delete'])
    type: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(['Waiting', 'Approved', 'Rejected']) 
    status: string;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsString()
    info_remark?: string;

    @IsOptional()
    @IsNumber()
    approved_by?: number;

    @IsOptional()
    @IsNumber()
    rejected_by?: number;

    @IsOptional()
    @IsNumber()
    created_by?: number;

    @IsOptional()
    @IsNumber()
    updated_by?: number;

    @IsOptional()
    @IsNumber()
    deleted_by?: number; // Tambahkan jika diperlukan

    @IsNotEmpty()
    @IsString()
    DataBefore: string;

    @IsNotEmpty()
    @IsString()
    DataAfter: string;
}