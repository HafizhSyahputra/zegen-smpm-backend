import { Exclude, Expose } from 'class-transformer';  

export class MerchantEntity {  
  constructor(partial: Partial<MerchantEntity>) {  
    Object.assign(this, partial);  
  }  

  @Expose()  
  id: number;  

  @Expose()  
  region_id: number;  

  @Expose()  
  mid: number;  

  @Expose()  
  name: string;  

  @Expose()  
  category: string;  

  @Expose()  
  customer_name: string;  

  @Expose()  
  telephone?: string;  

  @Expose()  
  pic: string;  

  @Expose()  
  phone1: string;  

  @Expose()  
  phone2?: string;  

  @Expose()  
  address1: string;  

  @Expose()  
  address2: string;  

  @Expose()  
  address3: string;  

  @Expose()  
  address4: string;  

  @Expose()  
  district?: string;  

  @Expose()  
  subdistrict?: string;  

  @Expose()  
  city?: string;  

  @Expose()  
  province?: string;  

  @Expose()  
  postal_code: string;  

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