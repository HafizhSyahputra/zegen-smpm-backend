import { Module } from '@nestjs/common';
import { ActivityVendorReportController } from './activity-vendor-report.controller';
import { ActivityVendorReportService } from './activity-vendor-report.service';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditService } from '@smpm/audit/audit.service';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityVendorReportController],
  providers: [ActivityVendorReportService, AuditService]
})
export class ActivityVendorReportModule {}
