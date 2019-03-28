import { Module } from '@nestjs/common';
import { TagcloudService } from './tagcloud.service';
import { TagcloudController } from './tagcloud.controller';
import { TypeOrmModule } from '../../node_modules/@nestjs/typeorm';
import { Tagcloud } from './tagcloud.entity';
import { Feature } from '../filter/feature.entity';
import { FeatureService } from '../filter/feature.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tagcloud, Feature])],
  providers: [TagcloudService, FeatureService],
  controllers: [TagcloudController],
})
export class TagcloudModule {}
