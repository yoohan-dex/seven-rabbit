import { Test, TestingModule } from '@nestjs/testing';
import { ScantimeService } from './scantime.service';

describe('ScantimeService', () => {
  let service: ScantimeService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScantimeService],
    }).compile();
    service = module.get<ScantimeService>(ScantimeService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
