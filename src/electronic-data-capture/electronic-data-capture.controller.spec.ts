import { Test, TestingModule } from '@nestjs/testing';
import { ElectronicDataCaptureController } from './electronic-data-capture.controller';
import { ElectronicDataCaptureService } from './electronic-data-capture.service';

describe('ElectronicDataCaptureController', () => {
  let controller: ElectronicDataCaptureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElectronicDataCaptureController],
      providers: [ElectronicDataCaptureService],
    }).compile();

    controller = module.get<ElectronicDataCaptureController>(ElectronicDataCaptureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
