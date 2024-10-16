import { Test, TestingModule } from '@nestjs/testing';
import { NominalController } from './nominal.controller';

describe('NominalController', () => {
  let controller: NominalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NominalController],
    }).compile();

    controller = module.get<NominalController>(NominalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
