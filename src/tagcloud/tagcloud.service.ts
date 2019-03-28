import { Injectable } from '@nestjs/common';
import { InjectRepository } from '../../node_modules/@nestjs/typeorm';
import { Tagcloud } from './tagcloud.entity';
import {
  Repository,
  createQueryBuilder,
  Between,
} from '../../node_modules/typeorm';
import { format } from '../shared/utils/formatTime';

@Injectable()
export class TagcloudService {
  constructor(
    @InjectRepository(Tagcloud)
    private readonly tagcloudRepository: Repository<Tagcloud>,
  ) {}

  async recordTags(featureIds: number[]) {
    const tagcloudArray = featureIds.map(id => {
      const tagcloud = new Tagcloud();

      tagcloud.featureId = id;

      return tagcloud;
    });

    return await this.tagcloudRepository.save(tagcloudArray);
  }

  async getTagcloudByTime(
    from?: string,
    to?: string,
  ): Promise<
    Array<{
      featureId: number;
      count: number;
    }>
  > {
    const query = createQueryBuilder()
    .select('featureId', 'featureId')
    .addSelect('count(*)', 'count')
      .from('tagcloud', 'tagcloud')
      .groupBy('featureId')
      .orderBy('count', 'DESC')
      .limit(20);
// todo wait for select features
    if (from && to) {
      query.where({
        actionTime: Between(format(from), format(to)),
      });
    }

    const matchItems = await query.getRawMany();
    return matchItems;
  }
}
