import { Test, TestingModule } from '@nestjs/testing';
import { JobOrderReportService } from './job-order-report.service';

describe('JobOrderReportService', () => {
  let service: JobOrderReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobOrderReportService],
    }).compile();

    service = module.get<JobOrderReportService>(JobOrderReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
