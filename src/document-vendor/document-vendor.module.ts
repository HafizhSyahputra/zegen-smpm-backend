import { Module } from '@nestjs/common';
import { DocumentVendorService } from './document-vendor.service';
import { DocumentVendorController } from './document-vendor.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditService } from '@smpm/audit/audit.service';

@Module({
  imports: [PrismaModule],
  providers: [DocumentVendorService, AuditService],
  controllers: [DocumentVendorController]
})
export class DocumentVendorModule {}
