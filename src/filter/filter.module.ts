import { Module } from '@nestjs/common';
import { FilterController } from './filter.controller';
import { FilterService } from './filter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from './feature.entity';
import { FeatureService } from './feature.service';
import { Filter } from './filter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Feature, Filter])],
  controllers: [FilterController],
  providers: [FilterService, FeatureService],
})
export class FilterModule {}
