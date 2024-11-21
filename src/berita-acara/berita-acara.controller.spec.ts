import { Test, TestingModule } from '@nestjs/testing';
import { BeritaAcaraController } from './berita-acara.controller';

describe('BeritaAcaraController', () => {
  let controller: BeritaAcaraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeritaAcaraController],
    }).compile();

    controller = module.get<BeritaAcaraController>(BeritaAcaraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
