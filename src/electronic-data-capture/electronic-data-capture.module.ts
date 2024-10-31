import { Module } from '@nestjs/common';
import { ElectronicDataCaptureService } from './electronic-data-capture.service';
import { ElectronicDataCaptureController } from './electronic-data-capture.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { UserModule } from '@smpm/user/user.module';

@Module({
  imports: [PrismaModule,     UserModule,  ],
  controllers: [ElectronicDataCaptureController],
  providers: [ElectronicDataCaptureService, PrismaService],
  exports: [ElectronicDataCaptureService], // Ekspor service agar bisa di-inject oleh modul lain
})
export class ElectronicDataCaptureModule {}