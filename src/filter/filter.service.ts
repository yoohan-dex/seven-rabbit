import { Injectable } from '@nestjs/common';
import { Feature } from './feature.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Filter } from './filter.entity';
import {
  CreateFilterDto,
  CreateFeatureDto,
  UpdateFilterDto,
  UpdateFeatureDto,
} from './filter.dto';

@Injectable()
export class FilterService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
    @InjectRepository(Filter)
    private readonly filterRepository: Repository<Filter>,
  ) {}

  async getAll(): Promise<Filter[]> {
    return await this.filterRepository.find();
  }

  async getOne(id: number) {
    return await this.filterRepository.findOne(id);
  }

  async create(createFilterObj: CreateFilterDto): Promise<Filter> {
    const features = await this.createFeature(createFilterObj.features);
    const pos = JSON.stringify(features.map(f => f.id));
    const filter = new Filter();

    filter.name = createFilterObj.name;
    filter.features = features;
    filter.pos = pos;
    return this.filterRepository.save(filter);
  }

  createFeature(createFeatureDto: CreateFeatureDto[]): Promise<Feature[]> {
    return this.featureRepository.save(createFeatureDto as Feature[]);
  }

  async updateFeature(updateFeatures: UpdateFeatureDto[]) {
    return this.featureRepository.save(updateFeatures);
  }

  async update(updateFilterDto: UpdateFilterDto) {
    const features = await this.createFeature(updateFilterDto.features);
    const pos = JSON.stringify(features.map(f => f.id));
    const filter = await this.filterRepository.findOne(updateFilterDto.id);

    filter.name = updateFilterDto.name;
    filter.features = features;
    filter.pos = pos;
    return this.filterRepository.save(filter);
  }
}
