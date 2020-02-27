import { Test, TestingModule } from '@nestjs/testing';
import { QyService } from './qy.service';

describe('QyService', () => {
  let service: QyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QyService],
    }).compile();

    service = module.get<QyService>(QyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
