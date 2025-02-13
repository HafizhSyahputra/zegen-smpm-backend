import { Exclude, Expose } from 'class-transformer';

export class DocMerchantEntity {
  constructor(partial: Partial<DocMerchantEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;
  @Expose()
  merchant_name: string;
  @Expose()
  longitude: string;
  @Expose()
  latitude: string;
  @Expose()
  file1?: string;
  @Expose()
  file2?: String;
  @Expose()
  location: String;
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
