import { Test, TestingModule } from '@nestjs/testing';
import { GenOrderService } from './gen-order.service';

describe('GenOrderService', () => {
  let service: GenOrderService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenOrderService],
    }).compile();
    service = module.get<GenOrderService>(GenOrderService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
