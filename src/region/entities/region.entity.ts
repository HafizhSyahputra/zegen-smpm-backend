import { Region } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class RegionEntity implements Region {
  constructor(partial: Partial<RegionEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;
  
  @Expose()
  region_group: number;


  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  description: string;

  @Exclude()
  created_by: number;
  @Exclude()
  updated_by: number;
  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;
  @Exclude()
  deleted_at: Date;
}
