import { ColumnReceivedIn } from '@smpm/common/constants/enum';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { IsEnum, IsOptional, IsString, IsArray, IsIn } from 'class-validator';
export class PageOptionReceivedInDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  search_by: ColumnReceivedIn[];
  @IsOptional()
  @IsEnum(ColumnReceivedIn)
  order_by: ColumnReceivedIn;
  // Tambahkan parameter status
  @IsOptional()
  @IsString()
  @IsIn(['waiting', 'approved']) // Validasi hanya 'waiting' atau 'approved'
  status?: string;
}