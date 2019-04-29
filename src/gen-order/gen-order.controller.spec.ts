import { Test, TestingModule } from '@nestjs/testing';
import { GenOrderController } from './gen-order.controller';

describe('GenOrder Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [GenOrderController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: GenOrderController = module.get<GenOrderController>(GenOrderController);
    expect(controller).toBeDefined();
  });
});
