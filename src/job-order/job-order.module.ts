// src/job-order/job-order.module.ts

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
import { ReceivedInModule } from '@smpm/received-in/received-in.module';
import { ReceivedOutModule } from '@smpm/received-out/received-out.module';
import { ReceivedInService } from '@smpm/received-in/received-in.service';
import { ReceivedOutService } from '@smpm/received-out/received-out.service';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    JobOrderReportModule,
    ReceivedInModule, 
    ReceivedOutModule, 
  ],
  controllers: [JobOrderController],
  providers: [
    JobOrderService,
    RegionService,
    VendorService,
    MediaService,
    AuditService,
    ApproveService,
    DocumentVendorService,
    MerchantService,
    ElectronicDataCaptureService,
    ReceivedInService,
    ReceivedOutService,
  ],
})
export class JobOrderModule {}