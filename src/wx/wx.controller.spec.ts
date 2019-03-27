import { Test, TestingModule } from '@nestjs/testing';
import { WxController } from './wx.controller';

describe('Wx Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [WxController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: WxController = module.get<WxController>(WxController);
    expect(controller).toBeDefined();
  });
});
