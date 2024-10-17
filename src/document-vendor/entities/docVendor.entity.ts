import { Exclude, Expose } from 'class-transformer';

export class DocVendorEntity {
  constructor(partial: Partial<DocVendorEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;
  @Expose()
  job_order_no: string;
  @Expose()
  edc_brand: string;
  @Expose()
  jo_type: string;
  @Expose()
  vendor_name: string;
  @Expose()
  tanggal_perjanjian: Date;
  // @Expose()
  // vendor_id: number;
  // @Expose()
  // region_id: number;
  // @Expose()
  // mid: string;
  // @Expose()
  // tid: string;
  @Expose()
  file1?: string;
  @Expose()
  file2?: String;
  @Expose()
  location?: String;
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
