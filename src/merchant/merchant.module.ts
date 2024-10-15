import { Module } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { AuditService } from '@smpm/audit/audit.service';
import { DocumentMerchantModule } from '@smpm/document-merchant/document-merchant.module';
import { DocumentMerchantService } from '@smpm/document-merchant/document-merchant.service';
import { ApproveMerchantService } from '@smpm/approve-merchant/approve-merchant.service';

@Module({
  imports: [DocumentMerchantModule],
  controllers: [MerchantController],
  providers: [MerchantService, PrismaService, AuditService, DocumentMerchantService,ApproveMerchantService],
})
export class MerchantModule {}