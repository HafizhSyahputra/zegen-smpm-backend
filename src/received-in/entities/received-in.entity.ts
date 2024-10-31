import { ElectronicDataCapture } from "@smpm/electronic-data-capture/entities/electronic-data-capture.entity";
import { Expose, Type } from "class-transformer";

  export class ReceivedInEntity {
    @Expose()
      id: number;
      id_joborder: number;
      id_edc: number;
      id_region: number;
      id_vendor: number;
      id_merchant: number;
      status: string;
      petugas: string;
      kondisibarang: string;
      approved_by: number;
      created_by: number;
      updated_by: number;
      created_at: Date;
      updated_at: Date;
      serial_number: string;
      tid: string;
      deleted_at: Date | null;

    
  
      constructor(partial: Partial<ReceivedInEntity>) {
        Object.assign(this, partial);
      }
    }