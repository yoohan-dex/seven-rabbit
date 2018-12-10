import { Test, TestingModule } from '@nestjs/testing';
import { BuyerShowService } from './buyer-show.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyerShow } from './buyer-show.entity';
import { Image } from '../common/common.entity';

describe('BuyerShowService', () => {
  let service: BuyerShowService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(),
        TypeOrmModule.forFeature([BuyerShow, Image]),
      ],
      providers: [BuyerShowService],
    }).compile();
    service = module.get<BuyerShowService>(BuyerShowService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
