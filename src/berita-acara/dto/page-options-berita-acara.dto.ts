import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ColumnBeritaAcara } from '@smpm/common/constants/enum';

export class PageOptionBeritaAcaraDto extends PageOptionsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ColumnBeritaAcara, { each: true })
  search_by?: string[];

  @IsOptional()
  @IsEnum(ColumnBeritaAcara)
  order_by?: string;
}