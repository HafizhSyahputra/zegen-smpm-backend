import { Test, TestingModule } from '@nestjs/testing';
import { DocumentMerchantService } from './document-merchant.service';

describe('DocumentMerchantService', () => {
  let service: DocumentMerchantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentMerchantService],
    }).compile();

    service = module.get<DocumentMerchantService>(DocumentMerchantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
