import { Module } from '@nestjs/common';
import { NominalService } from './nominal.service';
import { NominalController } from './nominal.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditService } from '@smpm/audit/audit.service';

@Module({
  imports: [PrismaModule],
  providers: [NominalService, AuditService],
  controllers: [NominalController]
})
export class NominalModule {}
