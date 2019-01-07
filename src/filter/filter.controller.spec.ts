import { Test, TestingModule } from '@nestjs/testing';
import { FilterController } from './filter.controller';

describe('Filter Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [FilterController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: FilterController = module.get<FilterController>(FilterController);
    expect(controller).toBeDefined();
  });
});
