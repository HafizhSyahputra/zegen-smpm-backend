import { transformEntity } from '@smpm/common/transformer/entity.transformer';
import { Exclude, Expose } from 'class-transformer';

export class ActivityVendorReportEntity {
  constructor(partial: Partial<ActivityVendorReportEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;

  @Expose()
  job_order_no: string;

  @Expose()
  vendor_id: number;

  @Expose()
  nominal: string;

  @Expose()
  mid: string;

  @Expose()
  tid: string;

  @Expose()
  status: string;

  @Expose()
  jenis: string;

  @Expose()
  description: string;

  @Expose()
  amount: number;

  @Expose()
  petugas: string;

  @Expose()
  edc_brand: string;

  @Expose()
  edc_brand_type: string;

  @Expose()
  edc_serial_number: string;

  @Expose()
  edc_note?: string;

  @Expose()
  edc_action?: string;

  @Expose()
  information: string;

  @Expose()
  arrival_time?: Date;

  @Expose()
  start_time?: Date;

  @Expose()
  end_time?: Date;

  @Expose()
  communication_line?: string;

  @Expose()
  direct_line_number?: string;

  @Expose()
  simcard_provider?: string;

  @Expose()
  paper_supply?: string;

  @Expose()
  merchant_pic?: string;

  @Expose()
  merchant_pic_phone?: string;

  @Expose()
  swipe_cash_indication?: string;

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