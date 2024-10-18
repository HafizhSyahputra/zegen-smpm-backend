import { Test, TestingModule } from '@nestjs/testing';
import { ActivityVendorReportService } from './activity-vendor-report.service';

describe('ActivityVendorReportService', () => {
  let service: ActivityVendorReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityVendorReportService],
    }).compile();

    service = module.get<ActivityVendorReportService>(ActivityVendorReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
