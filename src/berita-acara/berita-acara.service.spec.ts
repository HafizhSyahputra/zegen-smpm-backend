import { Test, TestingModule } from '@nestjs/testing';
import { BeritaAcaraService } from './berita-acara.service';

describe('BeritaAcaraService', () => {
  let service: BeritaAcaraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BeritaAcaraService],
    }).compile();

    service = module.get<BeritaAcaraService>(BeritaAcaraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
