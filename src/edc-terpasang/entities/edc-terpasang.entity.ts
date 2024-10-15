import { EDCTerpasang } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class EDCTerpasangEntity implements EDCTerpasang {
  constructor(partial: Partial<EDCTerpasangEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;

  @Expose()
  owner_id: number;

  @Expose()
  merchant_id: number;

  @Expose()
  mid: string;

  @Expose()
  tid: string;

  @Expose()
  brand: string;

  @Expose()
  brand_type: string;

  @Expose()
  serial_number: string;

  @Expose()
  status_owner: string;

  @Expose()
  status_owner_desc: string;

  @Expose()
  status_machine: string;

  @Expose()
  status_machine_desc: string;

  @Expose()
  status_active: boolean;

  @Expose()
  simcard_provider: string;

  @Expose()
  simcard_number: string;

  @Expose()
  info: string;

  @Expose()
  region: string;

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