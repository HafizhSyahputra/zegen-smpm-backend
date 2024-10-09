import { Test, TestingModule } from '@nestjs/testing';
import { ReceivedInController } from './received-in.controller';

describe('ReceivedInController', () => {
  let controller: ReceivedInController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceivedInController],
    }).compile();

    controller = module.get<ReceivedInController>(ReceivedInController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
