import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';

describe('StatisticsService', () => {
  let service: StatisticsService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatisticsService],
    }).compile();
    service = module.get<StatisticsService>(StatisticsService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
