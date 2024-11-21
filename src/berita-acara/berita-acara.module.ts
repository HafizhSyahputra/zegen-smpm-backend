import { Module } from '@nestjs/common';
import { BeritaAcaraController } from './berita-acara.controller';
import { BeritaAcaraService } from './berita-acara.service';
import { PrismaModule } from '@smpm/prisma/prisma.module';
import { AuditModule } from '@smpm/audit/audit.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
  ],
  controllers: [BeritaAcaraController],
  providers: [BeritaAcaraService],
  exports: [BeritaAcaraService],
})
export class BeritaAcaraModule {}