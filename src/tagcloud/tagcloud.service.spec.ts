import { Test, TestingModule } from '@nestjs/testing';
import { TagcloudService } from './tagcloud.service';

describe('TagcloudService', () => {
  let service: TagcloudService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagcloudService],
    }).compile();
    service = module.get<TagcloudService>(TagcloudService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
