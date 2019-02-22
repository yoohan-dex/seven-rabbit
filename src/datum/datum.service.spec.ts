import { Test, TestingModule } from '@nestjs/testing';
import { DatumService } from './datum.service';

describe('DatumService', () => {
  let service: DatumService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatumService],
    }).compile();
    service = module.get<DatumService>(DatumService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
