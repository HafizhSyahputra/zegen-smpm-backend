// src/payment/entities/payment.entity.ts
export class PaymentEntity {
    id_payment: number;
    id_vendor: number;
    job_order_ids: string;
    job_order_report_ids: string;
    tgl_submit: Date;
    tgl_approve: Date;
    approved_by: number;
    note: string;
    invoice_code: string;
    status: string;
    subject: string;
    reason: string;
    harga_total: string;
    created_by: number;
    updated_by: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
  }