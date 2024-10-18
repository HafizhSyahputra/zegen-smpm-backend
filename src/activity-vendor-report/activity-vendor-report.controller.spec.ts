import { Test, TestingModule } from '@nestjs/testing';
import { ActivityVendorReportController } from './activity-vendor-report.controller';

describe('ActivityVendorReportController', () => {
  let controller: ActivityVendorReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityVendorReportController],
    }).compile();

    controller = module.get<ActivityVendorReportController>(ActivityVendorReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
