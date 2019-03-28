import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';

describe('Statistics Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StatisticsController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: StatisticsController = module.get<StatisticsController>(StatisticsController);
    expect(controller).toBeDefined();
  });
});
