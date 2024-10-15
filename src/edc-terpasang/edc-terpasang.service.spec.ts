import { Test, TestingModule } from '@nestjs/testing';
import { EdcTerpasangService } from './edc-terpasang.service';

describe('EdcTerpasangService', () => {
  let service: EdcTerpasangService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EdcTerpasangService],
    }).compile();

    service = module.get<EdcTerpasangService>(EdcTerpasangService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
