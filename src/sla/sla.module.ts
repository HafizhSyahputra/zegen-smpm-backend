import { Module } from '@nestjs/common';  
import { BullModule } from '@nestjs/bull';  
import { SlaService } from './sla.service';  
import { SlaController } from './sla.controller';  
import { SlaProcessor } from './sla.processor';  
import { PrismaModule } from '../prisma/prisma.module';  
import { AuditModule } from '../audit/audit.module';  

@Module({  
  imports: [  
    PrismaModule,  
    AuditModule,  
    BullModule.registerQueue({  
      name: 'sla-update',  
      defaultJobOptions: {  
        timeout: 3600000,  
        attempts: 3,  
        backoff: {  
          type: 'exponential',  
          delay: 1000,  
        },  
      },  
    }),   
  ],  
  controllers: [SlaController],  
  providers: [SlaService, SlaProcessor],  
  exports: [SlaService],  
})  
export class SlaModule {}