import { Test, TestingModule } from '@nestjs/testing';
import { DocumentVendorController } from './document-vendor.controller';

describe('DocumentVendorController', () => {
  let controller: DocumentVendorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentVendorController],
    }).compile();

    controller = module.get<DocumentVendorController>(DocumentVendorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
