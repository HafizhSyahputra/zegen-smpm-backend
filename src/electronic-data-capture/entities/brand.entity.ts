import { EdcBrandType } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class BrandEntity implements EdcBrandType {
  constructor(partial: Partial<BrandEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;

  @Expose()
  brand: string;

  @Exclude()
  type: string;

  @Exclude()
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