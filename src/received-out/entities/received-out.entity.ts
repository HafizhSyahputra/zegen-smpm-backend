// src/received-out/entities/received-out.entity.ts

export class ReceivedOutEntity {
    id: number;
    id_joborder?: number;
    id_edc?: number;
    id_region?: number;
    id_vendor?: number;
    id_merchant?: number;
    status: string;
    approved_by?: number;
    created_by?: number;
    updated_by?: number;
    created_at: Date;
    updated_at: Date;
    serial_number?: string;
    tid?: string;
    deleted_at: Date | null;
  
    constructor(partial: Partial<ReceivedOutEntity>) {
      Object.assign(this, partial);
    }
  }
  