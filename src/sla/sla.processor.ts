import { Processor, Process } from '@nestjs/bull';  
import { Logger } from '@nestjs/common';  
import { Job } from 'bull';  
import { SlaService } from './sla.service';  

@Processor('sla-update')  
export class SlaProcessor {  
  private readonly logger = new Logger(SlaProcessor.name);  

  constructor(private readonly slaService: SlaService) {}  

  @Process('update-duration')  
  async handleUpdate(job: Job) {  
    this.logger.log('Processing SLA update job...');  
    try {  
      const result = await this.slaService.updateDurationBatch();  
      this.logger.log(  
        `SLA update completed: ${result.totalProcessed} records processed, ` +  
        `${result.totalUpdated} records updated`  
      );  
      return result;  
    } catch (error) {  
      this.logger.error('Failed to process SLA update job:', error);  
      throw error;  
    }  
  }  
}  