// src/payment/dto/vendor-billing.dto.ts

export class VendorBillingResponseDto {
    vendor_id: number;
    total_billing: number;
    payments: {
      id_payment: number;
      invoice_code: string;
      status: string;
      harga_total: string;
      job_orders: {
        id: number;
        no: string;
        type: string;
        nominal_awal: string;
        // ... tambahkan field lain yang diperlukan
      }[];
    }[];
  }
  