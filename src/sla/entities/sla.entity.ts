export class SLAEntity {  
  id: number;  
  job_order_no: string;  
  vendor_id: number;  
  region_id: number;  
  region_group_id: number;  
  tid: string;  
  mid: string;  
  sla_region: number;  
  open_time: Date;  
  target_time: Date;  
  status_sla: string;  
  solved_time?: Date;  
  status?: string;  
  duration?: number;  
  created_by?: number;  
  updated_by?: number;  
  created_at: Date;  
  updated_at: Date;  
  deleted_at?: Date;  

  constructor(partial: Partial<SLAEntity>) {  
    Object.assign(this, partial);  
  }  
}