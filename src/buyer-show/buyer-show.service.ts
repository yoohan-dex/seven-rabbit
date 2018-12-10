import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuyerShow } from './buyer-show.entity';
import { Repository } from 'typeorm';
import { CreateBuyerShowDto, QueryBuyerShowDto } from './buyer-show.dto';
import { Image } from '../common/common.entity';

@Injectable()
export class BuyerShowService {
  constructor(
    @InjectRepository(BuyerShow)
    private readonly buyerShowRepository: Repository<BuyerShow>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async saveOne(data: CreateBuyerShowDto) {
    const images = await this.imageRepository.findByIds(data.detail);
    const buyerShow = new BuyerShow();
    buyerShow.name = data.name;
    buyerShow.detail = images;
    return await this.buyerShowRepository.save(buyerShow);
  }

  async getList(
    query: QueryBuyerShowDto = {
      page: 1,
      size: 8,
    },
  ) {
    const [list, total] = await this.buyerShowRepository.findAndCount({
      skip: (query.page - 1) * query.size,
      take: query.size,
    });
    return {
      list,
      total,
    };
  }
  async getNew8() {
    return await this.buyerShowRepository.find({
      order: { id: 'DESC' },
      take: 8,
    });
  }
}
