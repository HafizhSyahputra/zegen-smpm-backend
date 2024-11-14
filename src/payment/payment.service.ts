import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApprovePaymentDto } from './dto/approve-payment.dto';
import { SubmitPaymentDto } from './dto/submit-payment.dto';
import { Cron } from '@nestjs/schedule';
import { AddNoteDto } from './dto/add-note.dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async updatePaymentTotal(vendorId: number) {
    const payments = await this.prisma.payment.findMany({
      where: {
        id_vendor: vendorId,  
        deleted_at: null,
      },
    });

    await Promise.all(
      payments.map(async (payment) => {
        const jobOrderIds = payment.job_order_ids ? JSON.parse(payment.job_order_ids) : [];
        
        const jobOrders = await this.prisma.jobOrder.findMany({
          where: {
            id: { in: jobOrderIds }
          },
          select: {
            nominal_awal: true
          }
        });

        const totalHarga = jobOrders.reduce((sum, job) => {
          const nominal = job.nominal_awal ? parseInt(job.nominal_awal) : 0;
          return sum + nominal;
        }, 0);

        await this.prisma.payment.update({
          where: { id_payment: payment.id_payment },
          data: { 
            harga_total: totalHarga.toString(),
            updated_at: new Date()
          }
        });
      })
    );
  }

  async addJobOrderToPayment(jobOrderId: number, vendorId: number) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id_vendor: vendorId,
        status: 'Not Open',
        deleted_at: null
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!payment) {
      const newPayment = await this.prisma.payment.create({
        data: {
          id_vendor: vendorId,
          job_order_ids: JSON.stringify([jobOrderId]),
          invoice_code: `INV-${Date.now()}`,
          status: 'Not Open',
          harga_total: '0'
        }
      });

      await this.updatePaymentTotal(vendorId);
      return newPayment;
    }

    const existingIds = payment.job_order_ids ? JSON.parse(payment.job_order_ids) : [];
    const updatedIds = [...existingIds, jobOrderId];

    await this.prisma.payment.update({
      where: { id_payment: payment.id_payment },
      data: {
        job_order_ids: JSON.stringify(updatedIds),
        updated_at: new Date()
      }
    });

    await this.updatePaymentTotal(vendorId);
    return payment;
  }

  async addJobOrdersToPayment({
    vendorId,
    jobOrderIds,
    totalHarga,
    createdBy
  }: {
    vendorId: number;
    jobOrderIds: number[];
    totalHarga: number;
    createdBy: number;
  }) {
    try {
      console.log('Adding job orders to payment:', { vendorId, jobOrderIds, totalHarga });
  
      const existingPayment = await this.prisma.payment.findFirst({
        where: {
          id_vendor: vendorId,
          status: 'Not Open',
          deleted_at: null
        },
        orderBy: {
          created_at: 'desc'
        }
      });
  
      if (existingPayment) {
        const currentJobOrderIds = existingPayment.job_order_ids 
          ? JSON.parse(existingPayment.job_order_ids) 
          : [];
        const currentReportIds = existingPayment.job_order_report_ids 
          ? JSON.parse(existingPayment.job_order_report_ids) 
          : [];
        
        const updatedJobOrderIds = [...new Set([...currentJobOrderIds, ...jobOrderIds])];
        const updatedTotalHarga = (parseFloat(existingPayment.harga_total || '0') + totalHarga).toString();
  
        return await this.prisma.payment.update({
          where: { id_payment: existingPayment.id_payment },
          data: {
            job_order_ids: JSON.stringify(updatedJobOrderIds),
            job_order_report_ids: JSON.stringify(currentReportIds), // Maintain existing report IDs
            harga_total: updatedTotalHarga,
            updated_at: new Date(),
            updated_by: createdBy
          },
          include: {
            vendor: true
          }
        });
      } else {
        return await this.prisma.payment.create({
          data: {
            id_vendor: vendorId,
            job_order_ids: JSON.stringify(jobOrderIds),
            job_order_report_ids: JSON.stringify([]), // Initialize empty array
            invoice_code: `INV-${Date.now()}`,
            harga_total: totalHarga.toString(),
            status: 'Not Open',
            created_by: createdBy,
            updated_by: createdBy
          },
          include: {
            vendor: true
          }
        });
      }
    } catch (error) {
      console.error('Error in addJobOrdersToPayment:', error);
      throw new BadRequestException(`Failed to update payment: ${error.message}`);
    }
  }
  

  async findByVendorId(vendorId: number) {
    const payments = await this.prisma.payment.findMany({
      where: {
        id_vendor: vendorId,
        deleted_at: null,
      },
      include: {
        vendor: true,
      },
    });
  
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        const jobOrderIds = payment.job_order_ids ? JSON.parse(payment.job_order_ids) : [];
        const reportIds = payment.job_order_report_ids ? JSON.parse(payment.job_order_report_ids) : [];
  
        const jobOrders = await this.prisma.jobOrder.findMany({
          where: {
            id: {
              in: jobOrderIds,
            },
          },
          include: {
            region: true,
            vendor: true,
            merchant: true,
            JobOrderReport: {
              include: {
                MediaJobOrderReportProofOfVisit: {
                  include: {
                    media: true
                  }
                },
                MediaJobOrderReportOptionalPhoto: {
                  include: {
                    media: true
                  }
                },
                JobOrderReportEdcEquipmentDongle: true,
                JobOrderReportMaterialPromo: true,
                JobOrderReportProduct: true,
                JobOrderReportMaterialTraining: true,
              },
            },
            PreventiveMaintenanceReport: {
              include: {
                MediaJobOrderReportProofOfVisit: {
                  include: {
                    media: true
                  }
                },
                MediaJobOrderReportOptionalPhoto: {
                  include: {
                    media: true
                  }
                },
                JobOrderReportEdcEquipmentDongle: true,
                JobOrderReportMaterialPromo: true,
                JobOrderReportProduct: true,
                JobOrderReportMaterialTraining: true,
              },
            },
          },
        });
  
        const [jobOrderReports, pmReports] = await Promise.all([
          this.prisma.jobOrderReport.findMany({
            where: {
              id: {
                in: reportIds,
              },
            },
            include: {
              MediaJobOrderReportProofOfVisit: {
                include: {
                  media: true
                }
              },
              MediaJobOrderReportOptionalPhoto: {
                include: {
                  media: true
                }
              },
              JobOrderReportEdcEquipmentDongle: true,
              JobOrderReportMaterialPromo: true,
              JobOrderReportProduct: true,
              JobOrderReportMaterialTraining: true,
              job_order: {
                include: {
                  region: true,
                  vendor: true,
                  merchant: true,
                }
              }
            },
          }),
          this.prisma.preventiveMaintenanceReport.findMany({
            where: {
              id: {
                in: reportIds,
              },
            },
            include: {
              MediaJobOrderReportProofOfVisit: {
                include: {
                  media: true
                }
              },
              MediaJobOrderReportOptionalPhoto: {
                include: {
                  media: true
                }
              },
              JobOrderReportEdcEquipmentDongle: true,
              JobOrderReportMaterialPromo: true,
              JobOrderReportProduct: true,
              JobOrderReportMaterialTraining: true,
              job_order: {
                include: {
                  region: true,
                  vendor: true,
                  merchant: true,
                }
              }
            },
          }),
        ]);
  
        const totalHarga = jobOrders.reduce((sum, jobOrder) => {
          const nominal = jobOrder.nominal_awal ? parseInt(jobOrder.nominal_awal) : 0;
          return sum + nominal;
        }, 0);
  
        await this.prisma.payment.update({
          where: { id_payment: payment.id_payment },
          data: { harga_total: totalHarga.toString() },
        });
  
        const allReports = [...jobOrderReports, ...pmReports];
  
        return {
          ...payment,
          harga_total: totalHarga.toString(),
          job_orders: jobOrders,
          reports: allReports,
        };
      })
    );
  
    return enrichedPayments;
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const payment = await this.prisma.payment.create({
      data: {
        vendor: {
          connect: {
            id: createPaymentDto.id_vendor
          }
        },
        job_order_ids: createPaymentDto.job_order_ids,
        job_order_report_ids: '[]',
        invoice_code: createPaymentDto.invoice_code,
        harga_total: createPaymentDto.harga_total,
        status: 'Not Open',
        created_by: createPaymentDto.created_by || null,
        updated_by: createPaymentDto.updated_by || null,
      },
      include: {
        vendor: true,
      },
    });

    return payment;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findUnique({ where: { id_payment: id } });
    if (!payment) {
      throw new NotFoundException(`Payment dengan ID ${id} tidak ditemukan`);
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id_payment: id },
      data: {
        ...updatePaymentDto,
        updated_at: new Date(),
      },
      include: {
        vendor: true,
      },
    });

    return updatedPayment;
  }

  async addNote(addNoteDto: AddNoteDto) {
    const { id_payment, note } = addNoteDto;
    
    const payment = await this.prisma.payment.findUnique({
      where: { id_payment }
    });

    if (!payment) {
      throw new NotFoundException(`Payment dengan ID ${id_payment} tidak ditemukan`);
    }

    const allowedStatuses = ['Open', 'Waiting for Approval', 'Approved', 'Rejected'];
    if (!allowedStatuses.includes(payment.status)) {
      throw new BadRequestException(`Tidak dapat menambahkan note pada payment dengan status ${payment.status}`);
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id_payment },
      data: {
        note,
        updated_at: new Date(),
      },
      include: {
        vendor: true,
      },
    });

    return updatedPayment;
  }

  async submit(submitPaymentDto: SubmitPaymentDto) {
    const { id_payment, subject } = submitPaymentDto;
    const payment = await this.prisma.payment.findUnique({ where: { id_payment } });

    if (!payment) {
      throw new NotFoundException(`Payment dengan ID ${id_payment} tidak ditemukan`);
    }

    if (payment.status !== 'Open') {
      throw new BadRequestException('Hanya payment dengan status "Open" yang dapat diajukan');
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id_payment },
      data: {
        status: 'Waiting for Approval',
        subject,
        tgl_submit: new Date(),
      },
      include: {
        vendor: true,
      },
    });

    return updatedPayment;
  }

  async approve(approvePaymentDto: ApprovePaymentDto) {
    const { id_payment, status, reason } = approvePaymentDto;
    const payment = await this.prisma.payment.findUnique({ where: { id_payment } });

    if (!payment) {
      throw new NotFoundException(`Payment dengan ID ${id_payment} tidak ditemukan`);
    }

    if (payment.status !== 'Waiting for Approval') {
      throw new BadRequestException('Hanya payment dengan status "Waiting for Approval" yang dapat disetujui atau ditolak');
    }

    if (status === 'Approved') {
      return await this.prisma.payment.update({
        where: { id_payment },
        data: {
          status: 'Approved',
          tgl_approve: new Date(),
        },
        include: {
          vendor: true,
        },
      });
    } else if (status === 'Rejected') {
      if (!reason) {
        throw new BadRequestException('Alasan diperlukan saat menolak payment');
      }
      return await this.prisma.payment.update({
        where: { id_payment },
        data: {
          status: 'Rejected',
          reason,
        },
        include: {
          vendor: true,
        },
      });
    } else {
      throw new BadRequestException('Status tidak valid. Harus "Approved" atau "Rejected"');
    }
  }

  @Cron('0 0 14 10 * *')
  async handleCron() {
    const updated = await this.prisma.payment.updateMany({
      where: { status: 'Not Open' },
      data: { status: 'Open' },
    });
    console.log(`Tugas Terjadwal: Mengubah ${updated.count} payment menjadi 'Open'`);
  }

  async findAll() {
    return this.prisma.payment.findMany({
      include: {
        vendor: true,
      },
    });
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { 
        id_payment: id 
      },
      include: {
        vendor: true,
      },
    });
  
    if (!payment) {
      throw new NotFoundException(`Payment dengan ID ${id} tidak ditemukan`);
    }
  
    const jobOrderIds = payment.job_order_ids ? JSON.parse(payment.job_order_ids) : [];
    const reportIds = payment.job_order_report_ids ? JSON.parse(payment.job_order_report_ids) : [];
  
    const jobOrders = await this.prisma.jobOrder.findMany({
      where: {
        id: {
          in: jobOrderIds,
        },
      },
      include: {
        region: true,
        vendor: true,
        merchant: true,
        JobOrderReport: {
          include: {
            MediaJobOrderReportProofOfVisit: {
              include: {
                media: true
              }
            },
            MediaJobOrderReportOptionalPhoto: {
              include: {
                media: true
              }
            },
            JobOrderReportEdcEquipmentDongle: true,
            JobOrderReportMaterialPromo: true,
            JobOrderReportProduct: true,
            JobOrderReportMaterialTraining: true,
          },
        },
        PreventiveMaintenanceReport: {
          include: {
            MediaJobOrderReportProofOfVisit: {
              include: {
                media: true
              }
            },
            MediaJobOrderReportOptionalPhoto: {
              include: {
                media: true
              }
            },
            JobOrderReportEdcEquipmentDongle: true,
            JobOrderReportMaterialPromo: true,
            JobOrderReportProduct: true,
            JobOrderReportMaterialTraining: true,
          },
        },
      },
    });
  
    const [jobOrderReports, pmReports] = await Promise.all([
      this.prisma.jobOrderReport.findMany({
        where: {
          id: {
            in: reportIds,
          },
        },
        include: {
          MediaJobOrderReportProofOfVisit: {
            include: {
              media: true
            }
          },
          MediaJobOrderReportOptionalPhoto: {
            include: {
              media: true
            }
          },
          JobOrderReportEdcEquipmentDongle: true,
          JobOrderReportMaterialPromo: true,
          JobOrderReportProduct: true,
          JobOrderReportMaterialTraining: true,
          job_order: {
            include: {
              region: true,
              vendor: true,
              merchant: true,
            }
          }
        },
      }),
      this.prisma.preventiveMaintenanceReport.findMany({
        where: {
          id: {
            in: reportIds,
          },
        },
        include: {
          MediaJobOrderReportProofOfVisit: {
            include: {
              media: true
            }
          },
          MediaJobOrderReportOptionalPhoto: {
            include: {
              media: true
            }
          },
          JobOrderReportEdcEquipmentDongle: true,
          JobOrderReportMaterialPromo: true,
          JobOrderReportProduct: true,
          JobOrderReportMaterialTraining: true,
          job_order: {
            include: {
              region: true,
              vendor: true,
              merchant: true,
            }
          }
        },
      }),
    ]);
  
    const allReports = [...jobOrderReports, ...pmReports];
  
    return {
      ...payment,
      job_orders: jobOrders,
      reports: allReports,
    };
  }

  async getVendorTotalBilling(vendorId: number) {
    const payments = await this.findByVendorId(vendorId);
    
    const totalBilling = payments.reduce((sum, payment) => {
      return sum + (parseFloat(payment.harga_total) || 0);
    }, 0);

    return {
      vendor_id: vendorId,
      total_billing: totalBilling.toString(),
      payments: payments,
    };
  }

  async updateTotalHarga(paymentId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id_payment: paymentId },
      include: { vendor: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment dengan ID ${paymentId} tidak ditemukan`);
    }

    const jobOrderIds = payment.job_order_ids ? JSON.parse(payment.job_order_ids) : [];
    
    const jobOrders = await this.prisma.jobOrder.findMany({
      where: {
        id: {
          in: jobOrderIds
        }
      },
      select: {
        nominal_awal: true
      }
    });

    const totalHarga = jobOrders.reduce((sum, job) => {
      const nominal = job.nominal_awal ? parseInt(job.nominal_awal) : 0;
      return sum + nominal;
    }, 0);

    return await this.prisma.payment.update({
      where: { id_payment: paymentId },
      data: { 
        harga_total: totalHarga.toString(),
        updated_at: new Date()
      },
      include: {
        vendor: true
      }
    });
  }
}