import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditService } from '@smpm/audit/audit.service';

@Module({
  imports: [PrismaModule],
  controllers: [VendorController],
  providers: [VendorService, AuditService],
})
export class VendorModule {}
