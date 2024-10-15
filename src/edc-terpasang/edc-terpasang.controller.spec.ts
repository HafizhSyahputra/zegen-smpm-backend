import { Test, TestingModule } from '@nestjs/testing';
import { EdcTerpasangController } from './edc-terpasang.controller';

describe('EdcTerpasangController', () => {
  let controller: EdcTerpasangController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EdcTerpasangController],
    }).compile();

    controller = module.get<EdcTerpasangController>(EdcTerpasangController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
