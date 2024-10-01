import {
  ColumnJobOrder,
  JobOrderStatus,
  JobOrderType,
  Ownersip,
} from '@smpm/common/constants/enum';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { IsEnumArray } from '@smpm/common/validator/is-enum-array.validator';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class PageOptionJobOrderDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsEnumArray(ColumnJobOrder)
  search_by: ColumnJobOrder[];

  @IsOptional()
  @IsEnum(ColumnJobOrder)
  order_by: ColumnJobOrder;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => value.map((num: string) => parseInt(num)), {
    toClassOnly: true,
  })
  region_id: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => value.map((num: string) => parseInt(num)), {
    toClassOnly: true,
  })
  vendor_id: number[];

  @IsOptional()
  @IsArray()
  @IsEnumArray(JobOrderType)
  type: JobOrderType[];

  @IsOptional()
  @IsArray()
  @IsEnumArray(JobOrderStatus)
  status: JobOrderStatus[];

  @IsOptional()
  @IsArray()
  @IsEnumArray(Ownersip)
  ownership: Ownersip[];
}
