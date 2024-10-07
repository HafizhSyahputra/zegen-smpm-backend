import { Test, TestingModule } from '@nestjs/testing';
import { ApproveController } from './approve.controller';

describe('ApproveController', () => {
  let controller: ApproveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApproveController],
    }).compile();

    controller = module.get<ApproveController>(ApproveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
