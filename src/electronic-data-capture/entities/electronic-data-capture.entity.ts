// src/electronic-data-capture/entities/electronic-data-capture.entity.ts

import { Expose } from 'class-transformer';

export class ElectronicDataCapture {
  @Expose()
  id: number;

  @Expose()
  owner_id: number;

  @Expose()
  merchant_id: number | null; // Tambahkan ini

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
  region?: string;

  @Expose()
  status_machine_desc: string; 

  @Expose()
  status_active: boolean;

@Expose()
status_edc: string;

  @Expose()
  simcard_provider: string;

  @Expose()
  simcard_number: string;

  @Expose()
  info: string;

  @Expose()
  created_by: number;

  @Expose()
  updated_by: number;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  @Expose()
  deleted_at: Date;
}