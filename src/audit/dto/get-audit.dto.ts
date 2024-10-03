
import { IsOptional, IsString } from 'class-validator';

export class GetAuditQuery {
  @IsOptional()
  @IsString()
  search?: string;
}
