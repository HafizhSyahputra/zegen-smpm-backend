import { Module } from '@nestjs/common';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { RegionService } from '@smpm/region/region.service';
import { UserModule } from '@smpm/user/user.module';
import { VendorService } from '@smpm/vendor/vendor.service';
import { JobOrderController } from './job-order.controller';
import { JobOrderService } from './job-order.service';
import { MediaService } from '@smpm/media/media.service';
import { AuditService } from '@smpm/audit/audit.service';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [JobOrderController],
  providers: [JobOrderService, RegionService, VendorService, MediaService, AuditService],
})
export class JobOrderModule {}
