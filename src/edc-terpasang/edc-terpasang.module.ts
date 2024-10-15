
import { Module } from '@nestjs/common';
import { EDCTerpasangService } from './edc-terpasang.service';
import { EDCTerpasangController } from './edc-terpasang.controller';
import { PrismaModule } from '@smpm/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EDCTerpasangController],
  providers: [EDCTerpasangService],
  exports: [EDCTerpasangService], // Ensure EDCTerpasangService is exported

})
export class EDCTerpasangModule {}
