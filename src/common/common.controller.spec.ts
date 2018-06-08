import { Test, TestingModule } from '@nestjs/testing';
import { CommonController } from './common.controller';

describe('Common Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [CommonController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: CommonController = module.get<CommonController>(CommonController);
    expect(controller).toBeDefined();
  });
});
