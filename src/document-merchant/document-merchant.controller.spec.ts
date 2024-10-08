import { Test, TestingModule } from '@nestjs/testing';
import { DocumentMerchantController } from './document-merchant.controller';

describe('DocumentMerchantController', () => {
  let controller: DocumentMerchantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentMerchantController],
    }).compile();

    controller = module.get<DocumentMerchantController>(DocumentMerchantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
