import { Test, TestingModule } from '@nestjs/testing';
import { DocumentVendorService } from './document-vendor.service';

describe('DocumentVendorService', () => {
  let service: DocumentVendorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentVendorService],
    }).compile();

    service = module.get<DocumentVendorService>(DocumentVendorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
