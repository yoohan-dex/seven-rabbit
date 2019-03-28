import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from './common.service';

describe('CommonService', () => {
  let service: CommonService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonService],
    }).compile();
    service = module.get<CommonService>(CommonService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
