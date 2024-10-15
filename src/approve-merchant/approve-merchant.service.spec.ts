import { Test, TestingModule } from '@nestjs/testing';
import { ApproveMerchantService } from './approve-merchant.service';

describe('ApproveMerchantService', () => {
  let service: ApproveMerchantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApproveMerchantService],
    }).compile();

    service = module.get<ApproveMerchantService>(ApproveMerchantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
