import { Exclude, Expose } from 'class-transformer';

export class DocSLAEntity {
  constructor(partial: Partial<DocSLAEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;
  @Expose()
  job_order_no: string;
  @Expose()
  vendor_id: number;
  @Expose()
  region_id: number;
  @Expose()
  mid: string;
  @Expose()
  tid: string;
  @Expose()
  sla_region?: number;
  @Expose()
  open_time?: Date;
  @Expose()
  target_time?: Date;
  @Expose()
  status_sla?: string;
  @Expose()
  solved_time?: Date;
  @Expose()
  status?: string;
  @Expose()
  duration?: string;
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
