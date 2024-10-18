import { Module } from '@nestjs/common';
import { ActivityVendorReportController } from './activity-vendor-report.controller';
import { ActivityVendorReportService } from './activity-vendor-report.service';

@Module({
  controllers: [ActivityVendorReportController],
  providers: [ActivityVendorReportService]
})
export class ActivityVendorReportModule {}
