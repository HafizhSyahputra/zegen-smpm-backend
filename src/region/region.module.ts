import { Module } from '@nestjs/common';
import { RegionService } from './region.service';
import { RegionController } from './region.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditService } from '@smpm/audit/audit.service';

@Module({
  imports: [PrismaModule],
  controllers: [RegionController],
  providers: [RegionService, AuditService],
})
export class RegionModule {}
