import { Test, TestingModule } from '@nestjs/testing';
import { ApproveService } from './approve.service';

describe('ApproveService', () => {
  let service: ApproveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApproveService],
    }).compile();

    service = module.get<ApproveService>(ApproveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
