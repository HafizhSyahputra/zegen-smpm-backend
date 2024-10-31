import { PartialType } from '@nestjs/mapped-types';
import { CreateElectronicDataCaptureDto } from './create-electronic-data-capture.dto';
import { IsNumber, IsOptional, IsString, IsEmpty} from 'class-validator';

export class UpdateElectronicDataCaptureDto extends PartialType(CreateElectronicDataCaptureDto) {
    @IsOptional()
    @IsNumber()
    updated_by? : number;

    @IsString()
    @IsOptional()
    kondisibarang: string;
  
    @IsOptional()
    @IsEmpty()
    merchant_id?: number | null;  
}