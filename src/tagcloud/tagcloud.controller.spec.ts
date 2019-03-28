import { Test, TestingModule } from '@nestjs/testing';
import { TagcloudController } from './tagcloud.controller';

describe('Tagcloud Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [TagcloudController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: TagcloudController = module.get<TagcloudController>(TagcloudController);
    expect(controller).toBeDefined();
  });
});
