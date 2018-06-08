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

  createFeature(createFeatureData: {
    name: string;
    pos: number;
  }): Promise<Feature> {
    const feature = new Feature();
    feature.name = createFeatureData.name;
    feature.pos = createFeatureData.pos;
    return this.featureRepository.save(feature);
  }
}
