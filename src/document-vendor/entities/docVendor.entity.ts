import { Exclude, Expose } from 'class-transformer';

export class DocVendorEntity {
  constructor(partial: Partial<DocVendorEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;
  @Expose()
  no_perjanjian_kerjasama: string;
  @Expose()
  vendor_name: string;
  @Expose()
  tanggal_perjanjian: Date;
  @Expose()
  file1?: string;
  @Expose()
  file2?: String;
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
