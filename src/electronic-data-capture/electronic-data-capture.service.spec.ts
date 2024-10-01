import { Test, TestingModule } from '@nestjs/testing';
import { ElectronicDataCaptureService } from './electronic-data-capture.service';

describe('ElectronicDataCaptureService', () => {
  let service: ElectronicDataCaptureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ElectronicDataCaptureService],
    }).compile();

    service = module.get<ElectronicDataCaptureService>(ElectronicDataCaptureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
