// src/payment/payment.controller.ts

import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AddNoteDto } from './dto/add-note.dto';
import { ApprovePaymentDto } from './dto/approve-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SubmitPaymentDto } from './dto/submit-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Membuat Payment baru
  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  // Memperbarui Payment yang sudah ada
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto
  ) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  // Mengajukan Payment untuk disetujui
  @Post(':id/submit')
  async submit(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitPaymentDto: SubmitPaymentDto
  ) {
    submitPaymentDto.id_payment = id;
    return this.paymentService.submit(submitPaymentDto);
  }

  @Post(':id/add-note')
  async addNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() addNoteDto: AddNoteDto
  ) {
    addNoteDto.id_payment = id;
    return this.paymentService.addNote(addNoteDto);
  }


  // Menyetujui atau menolak Payment
  @Post(':id/approve')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() approvePaymentDto: ApprovePaymentDto
  ) {
    approvePaymentDto.id_payment = id;
    return this.paymentService.approve(approvePaymentDto);
  }

  // Mendapatkan semua Payment
  @Get()
  async findAll() {
    return this.paymentService.findAll();
  }

  // Mendapatkan Payment berdasarkan ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(id);
  }

  // Mendapatkan Payment berdasarkan vendor_id
  @Get('vendor/:vendorId')
  async findByVendorId(@Param('vendorId', ParseIntPipe) vendorId: number) {
    return this.paymentService.findByVendorId(vendorId);
  }

  

  // Mendapatkan total tagihan vendor
  @Get('vendor/:vendorId/total-billing')
  async getVendorTotalBilling(@Param('vendorId', ParseIntPipe) vendorId: number) {
    return this.paymentService.getVendorTotalBilling(vendorId);
  }
}