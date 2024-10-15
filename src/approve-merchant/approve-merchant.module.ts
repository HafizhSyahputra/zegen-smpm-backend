// src/approve-merchant/approve-merchant.module.ts

import { Module } from '@nestjs/common';
import { ApproveMerchantService } from './approve-merchant.service';
import { ApproveMerchantController } from './approve-merchant.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditService } from '@smpm/audit/audit.service';
import { MerchantModule } from '@smpm/merchant/merchant.module';
import { MerchantService } from '@smpm/merchant/merchant.service';
import { DocumentMerchantService } from '@smpm/document-merchant/document-merchant.service';

@Module({
  imports: [PrismaModule,MerchantModule],
  providers: [ApproveMerchantService, AuditService, MerchantService, DocumentMerchantService],
  controllers: [ApproveMerchantController],
})
export class ApproveMerchantModule {}