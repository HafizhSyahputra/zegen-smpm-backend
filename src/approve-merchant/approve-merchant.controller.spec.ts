import { Test, TestingModule } from '@nestjs/testing';
import { ApproveMerchantController } from './approve-merchant.controller';

describe('ApproveMerchantController', () => {
  let controller: ApproveMerchantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApproveMerchantController],
    }).compile();

    controller = module.get<ApproveMerchantController>(ApproveMerchantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
