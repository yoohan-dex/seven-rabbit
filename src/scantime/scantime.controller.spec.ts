import { Test, TestingModule } from '@nestjs/testing';
import { ScantimeController } from './scantime.controller';

describe('Scantime Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ScantimeController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: ScantimeController = module.get<ScantimeController>(ScantimeController);
    expect(controller).toBeDefined();
  });
});
