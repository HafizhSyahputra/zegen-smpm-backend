import { Test, TestingModule } from '@nestjs/testing';
import { ReceivedOutController } from './received-out.controller';

describe('ReceivedOutController', () => {
  let controller: ReceivedOutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceivedOutController],
    }).compile();

    controller = module.get<ReceivedOutController>(ReceivedOutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
