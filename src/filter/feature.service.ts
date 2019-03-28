import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from './feature.entity';

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
  ) {}

  async createFeature(createFeatureData: {
    name: string;
    pos: number;
  }): Promise<Feature> {
    const feature = new Feature();
    feature.name = createFeatureData.name;
    return await this.featureRepository.save(feature);
  }

  async selectByIds(ids: number[]) {
    await this.featureRepository.findByIds(ids);
  }
}
