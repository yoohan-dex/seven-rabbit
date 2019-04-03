import { Test, TestingModule } from '@nestjs/testing';
import { TopicController } from './topic.controller';

describe('Topic Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [TopicController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: TopicController = module.get<TopicController>(TopicController);
    expect(controller).toBeDefined();
  });
});
