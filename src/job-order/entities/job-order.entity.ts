import { transformEntity } from '@smpm/common/transformer/entity.transformer';
import { JobOrderReportEntity } from '@smpm/job-order-report/entities/joReport.entity';
import { MerchantEntity } from '@smpm/merchant/entities/merchant.entity';
import { PreventiveMaintenanceReportEntity } from '@smpm/preventive-maintenance-report/entities/pm-report.entity';
import { RegionEntity } from '@smpm/region/entities/region.entity';
import { VendorEntity } from '@smpm/vendor/entities/vendor.entity';
import { Exclude, Expose, Transform } from 'class-transformer';

export class JobOrderEntity {
  constructor(partial: Partial<JobOrderEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;

  @Expose()
  region_id: number;

  @Expose()
  vendor_id: number;

  @Expose()
  no: string;

  @Expose()
  type: string;

  @Expose()
  date: Date;

  @Expose()
  mid: string;

  @Expose()
  tid: string;

  @Expose()
  officer_name: string;

  @Expose()
  status: string;

  @Expose()
  merchant_name: string;

  @Expose()
  address1: string;

  @Expose()
  address2: string;

  @Expose()
  address3: string;

  @Expose()
  address4: string;

  @Expose()
  merchant_category: string;

  @Expose()
  ownership: string;

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

  @Expose()
  @Transform(({ value }) => transformEntity(RegionEntity, value))
  region: RegionEntity;

  @Expose()
  @Transform(({ value }) => transformEntity(VendorEntity, value))
  vendor: VendorEntity;

  @Expose()
  @Transform(({ value }) => transformEntity(MerchantEntity, value))
  merchant: MerchantEntity;

  @Expose()
  @Transform(({ value }) => transformEntity(JobOrderReportEntity, value))
  JobOrderReport: JobOrderReportEntity;
  
  @Expose()
  @Transform(({ value }) => transformEntity(PreventiveMaintenanceReportEntity, value))
  PreventiveMaintenanceReport: PreventiveMaintenanceReportEntity;
}
