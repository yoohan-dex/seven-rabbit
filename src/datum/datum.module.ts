import { Module } from '@nestjs/common';
import { DatumService } from './datum.service';
import { DatumController } from './datum.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimpleData, TopicData } from './datum.entity';
import { WxUser } from '../auth/auth.entity';
import { Product } from '../product/product.entity';
import { Topic } from '../topic/topic.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SimpleData, WxUser, Product, Topic, TopicData]),
  ],
  providers: [DatumService],
  controllers: [DatumController],
})
export class DatumModule {}
