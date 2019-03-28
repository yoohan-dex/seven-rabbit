import { Injectable } from '@nestjs/common';
import { InjectRepository } from '../../node_modules/@nestjs/typeorm';
import { Scantime } from './scantime.entity';
import {
  Repository,
  Between,
  createQueryBuilder,
} from '../../node_modules/typeorm';
import { format } from '../shared/utils/formatTime';

@Injectable()
export class ScantimeService {
  constructor(
    @InjectRepository(Scantime)
    private readonly scantimeRepository: Repository<Scantime>,
  ) {}

  async recordOne(productId: number, user: number, seconds: number) {
    const scantime = new Scantime();

    scantime.productId = productId;
    scantime.user = user;
    scantime.seconds = seconds;

    return await this.scantimeRepository.save(scantime);
  }

  async getScantimeByTime(from: string, to: string) {
    const matchItems = await createQueryBuilder()
      .select('*', 'scantimeItem')
      .addSelect('SUM(scantime.seconds)', 'period')
      .from('scantime', 'scantime')
      .groupBy('productId')
      .orderBy('period', 'DESC')
      .limit(20)
      .where({
        visitTime: Between(format(from), format(to)),
      })
      .getRawMany();
  }
}
