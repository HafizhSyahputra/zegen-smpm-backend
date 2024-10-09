import { Exclude, Expose, Transform } from 'class-transformer';

export class ApproveEntity {
  constructor(partial: Partial<ApproveEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;
  @Expose()
  id_jobOrder: number;
  @Expose()
  jo_report_id: number;
  @Expose()
  vendor_id: number;
  @Expose()
  region_id: number;
  @Expose()
  reason?: string;
  @Expose()
  info_remark?: string;
  @Expose()
  status: String;
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
