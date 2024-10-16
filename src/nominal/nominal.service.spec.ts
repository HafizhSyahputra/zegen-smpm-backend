import { Test, TestingModule } from '@nestjs/testing';
import { NominalService } from './nominal.service';

describe('NominalService', () => {
  let service: NominalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NominalService],
    }).compile();

    service = module.get<NominalService>(NominalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
