// src/approve-merchant/entities/approve-merchant.entity.ts

import { Exclude, Expose } from 'class-transformer';

export class ApproveMerchantEntity {
  constructor(partial: Partial<ApproveMerchantEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;

  @Expose()
  merchant_id?: number;

  @Expose()
  type: string;

  @Expose()
  status: string;

  @Expose()
  reason?: string;

  @Expose()
  info_remark?: string;

  @Expose()
  DataBefore: string;

  @Expose()
  DataAfter: string;

  @Exclude()
  approved_by?: number;

  @Exclude()
  rejected_by?: number;

  @Exclude()
  created_by?: number;

  @Exclude()
  updated_by?: number;

  @Exclude()
  created_at?: Date;

  @Exclude()
  updated_at?: Date;

  @Exclude()
  deleted_at?: Date;
}
  