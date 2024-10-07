import { Module } from '@nestjs/common';
import { JobOrderReportController } from './job-order-report.controller';
import { JobOrderReportService } from './job-order-report.service';
import { AuditService } from '@smpm/audit/audit.service';
import { MediaService } from '@smpm/media/media.service';
import { VendorService } from '@smpm/vendor/vendor.service';
import { RegionService } from '@smpm/region/region.service';
import { PrismaModule } from '@smpm/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JobOrderReportController],
  providers: [JobOrderReportService, AuditService, RegionService, VendorService, MediaService,]
})
export class JobOrderReportModule {}
