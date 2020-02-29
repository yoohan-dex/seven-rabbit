import { Test, TestingModule } from '@nestjs/testing';
import { QyController } from './qy.controller';

describe('Qy Controller', () => {
  let controller: QyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QyController],
    }).compile();

    controller = module.get<QyController>(QyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
