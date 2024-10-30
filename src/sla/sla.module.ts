import { Module } from '@nestjs/common';
import { SlaService } from './sla.service';
import { SlaController } from './sla.controller';

@Module({
  providers: [SlaService],
  controllers: [SlaController]
})
export class SlaModule {}
