import { Test, TestingModule } from '@nestjs/testing';
import { BuyerShowController } from './buyer-show.controller';

describe('BuyerShow Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [BuyerShowController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: BuyerShowController = module.get<BuyerShowController>(BuyerShowController);
    expect(controller).toBeDefined();
  });
});
