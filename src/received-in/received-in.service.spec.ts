import { Test, TestingModule } from '@nestjs/testing';
import { ReceivedInService } from './received-in.service';

describe('ReceivedInService', () => {
  let service: ReceivedInService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceivedInService],
    }).compile();

    service = module.get<ReceivedInService>(ReceivedInService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
