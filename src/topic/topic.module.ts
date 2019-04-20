import { Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '../common/common.entity';
import { Topic, TopicSort } from './topic.entity';
import { DatumService } from '../datum/datum.service';
import { SimpleData, TopicData } from '../datum/datum.entity';
import { WxUser } from '../auth/auth.entity';
import { Product } from '../product/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Image,
      Topic,
      TopicSort,
      SimpleData,
      WxUser,
      Product,
      TopicData,
    ]),
  ],
  controllers: [TopicController],
  providers: [TopicService, DatumService],
})
export class TopicModule {}
