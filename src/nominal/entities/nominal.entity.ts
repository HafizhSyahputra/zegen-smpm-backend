import { NominalJobOrder } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class NominalEntity implements NominalJobOrder {
  constructor(partial: Partial<NominalEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;
  @Expose()
  jenis: string;
  @Expose()
  vendor_id: number;
  @Expose()
  nominal: string;
  @Expose()
  tipe: string;
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
