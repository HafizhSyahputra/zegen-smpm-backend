import { Test, TestingModule } from '@nestjs/testing';
import { ReceivedOutService } from './received-out.service';

describe('ReceivedOutService', () => {
  let service: ReceivedOutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceivedOutService],
    }).compile();

    service = module.get<ReceivedOutService>(ReceivedOutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
