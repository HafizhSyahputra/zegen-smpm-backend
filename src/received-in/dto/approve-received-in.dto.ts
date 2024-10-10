import { IsNumber, IsOptional, IsString, IsIn } from 'class-validator';
export class ApproveReceivedInDto {
  @IsOptional()
  @IsNumber()
  approved_by?: number;
  @IsOptional()
  @IsNumber()
  updated_by?: number;
  @IsOptional()
  @IsString()
  @IsIn(['approved'])
  status?: string;  
}