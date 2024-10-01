import { Module } from '@nestjs/common';
import { ElectronicDataCaptureService } from './electronic-data-capture.service';
import { ElectronicDataCaptureController } from './electronic-data-capture.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { PrismaService } from '@smpm/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [ElectronicDataCaptureController],
  providers: [ElectronicDataCaptureService, PrismaService],
})
export class ElectronicDataCaptureModule {}
