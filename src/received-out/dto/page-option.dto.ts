import { ColumnReceivedOut } from '../../common/constants/enum';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class PageOptionReceivedOutDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  search_by: ColumnReceivedOut[];

  @IsOptional()
  @IsEnum(ColumnReceivedOut)
  order_by: ColumnReceivedOut;
}