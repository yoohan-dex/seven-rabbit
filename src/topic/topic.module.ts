import { Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '../common/common.entity';
import { Topic, TopicSort } from './topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image, Topic, TopicSort])],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}