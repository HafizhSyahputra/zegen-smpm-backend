import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import configuration from './common/config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { VendorModule } from './vendor/vendor.module';
import { RegionModule } from './region/region.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MerchantModule } from './merchant/merchant.module';
import { ElectronicDataCaptureModule } from './electronic-data-capture/electronic-data-capture.module';
import { JobOrderModule } from './job-order/job-order.module';
import { MediaModule } from './media/media.module';
import { AuditModule } from './audit/audit.module';
import { LookUpModule } from './lookup/lookup.module';
import { ApproveModule } from './approve/approve.module';
 
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    RoleModule,
    VendorModule,
    RegionModule,
    DashboardModule,
    MerchantModule,
    ElectronicDataCaptureModule,
    JobOrderModule,
    MediaModule,
    AuditModule,
    LookUpModule,
    ApproveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
