import { Test, TestingModule } from '@nestjs/testing';
import { JobOrderReportController } from './job-order-report.controller';

describe('JobOrderReportController', () => {
  let controller: JobOrderReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOrderReportController],
    }).compile();

    controller = module.get<JobOrderReportController>(JobOrderReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
