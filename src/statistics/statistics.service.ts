import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Statistics } from './statistics.entity';
import { Repository, createQueryBuilder, Between } from 'typeorm';
import { StatisticsDto } from './statistics.dto';
import { format } from '../shared/utils/formatTime';
import { mapObj } from '../shared/utils/mapObj';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Statistics)
    private readonly statisticsRepository: Repository<Statistics>,
  ) {}

  async recordItems(dto: StatisticsDto) {
    const statisticsArray = dto.productIds.map(id => {
      const statistics = new Statistics();
      statistics.productId = id;
      statistics.user = dto.user;
      statistics.type = dto.type;
      return statistics;
    });

    return await this.statisticsRepository.save(statisticsArray);
  }

  async getClickTimesByTime(from?: string, to?: string) {
    const query = createQueryBuilder('statistics')
      .select('productId', 'productId')
      .addSelect('count(*)', 'count')
      .leftJoinAndSelect(
        'product',
        'product',
        'product.id = statistics.productId',
      )
      // .leftJoinAndMapOne(
      //   'ppp',
      //   Product,
      //   'product',
      //   'product.id = statistics.productId',
      // )
      // .leftJoinAndMapOne(
      //   'product',
      //   'product',
      //   'product',
      //   'product.id = statistics.productId',
      // )
      // .from('statistics', 'statistics')
      .groupBy('productId')
      .orderBy('count', 'DESC')
      .limit(20);
    if (from && to) {
      query.where({
        type: 1,
        actionTime: Between(format(from), format(to)),
      });
    } else {
      query.where({
        type: 1,
      });
    }

    const matchItems = await query.getRawMany();

    return mapObj(matchItems, 'product');
  }
}
