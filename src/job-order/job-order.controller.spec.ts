import { Test, TestingModule } from '@nestjs/testing';
import { JobOrderController } from './job-order.controller';
import { JobOrderService } from './job-order.service';

describe('JobOrderController', () => {
  let controller: JobOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOrderController],
      providers: [JobOrderService],
    }).compile();

    controller = module.get<JobOrderController>(JobOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
