import { Test, TestingModule } from '@nestjs/testing';
import { JobOrderService } from './job-order.service';

describe('JobOrderService', () => {
  let service: JobOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobOrderService],
    }).compile();

    service = module.get<JobOrderService>(JobOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
