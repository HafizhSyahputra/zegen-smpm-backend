import { Module } from '@nestjs/common';
import { DocumentMerchantService } from './document-merchant.service';
import { DocumentMerchantController } from './document-merchant.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditService } from '@smpm/audit/audit.service';

@Module({
  imports: [PrismaModule],
  providers: [DocumentMerchantService, AuditService],
  controllers: [DocumentMerchantController]
})
export class DocumentMerchantModule {}
