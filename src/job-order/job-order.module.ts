import { Module } from '@nestjs/common';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { RegionService } from '@smpm/region/region.service';
import { UserModule } from '@smpm/user/user.module';
import { VendorService } from '@smpm/vendor/vendor.service';
import { JobOrderController } from './job-order.controller';
import { JobOrderService } from './job-order.service';
import { MediaService } from '@smpm/media/media.service';
import { AuditService } from '@smpm/audit/audit.service';
import { ApproveService } from '@smpm/approve/approve.service';
import { JobOrderReportModule } from '@smpm/job-order-report/job-order-report.module';
import { DocumentVendorService } from '@smpm/document-vendor/document-vendor.service';
import { MerchantService } from '@smpm/merchant/merchant.service';
import { ElectronicDataCaptureService } from '@smpm/electronic-data-capture/electronic-data-capture.service';

@Module({
  imports: [PrismaModule, UserModule, JobOrderReportModule],
  controllers: [JobOrderController],
  providers: [JobOrderService, RegionService, VendorService, MediaService, AuditService, ApproveService, DocumentVendorService, MerchantService, ElectronicDataCaptureService],
})
export class JobOrderModule {}
