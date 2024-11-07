import { Vendor } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class VendorEntity implements Vendor {
  constructor(partial: Partial<VendorEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;

  @Expose()
  no_perjanjian_kerjasama: string;

  @Expose()
  name: string;
  @Expose()
  jenis: string;

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
