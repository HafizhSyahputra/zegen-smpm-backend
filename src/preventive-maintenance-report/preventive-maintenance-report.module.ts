import { Module } from '@nestjs/common';
import { PreventiveMaintenanceReportController } from './preventive-maintenance-report.controller';
import { PreventiveMaintenanceReportService } from './preventive-maintenance-report.service';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditService } from '@smpm/audit/audit.service';

@Module({
  imports: [PrismaModule],
  controllers: [PreventiveMaintenanceReportController],
  providers: [PreventiveMaintenanceReportService, AuditService]
})
export class PreventiveMaintenanceReportModule {}
