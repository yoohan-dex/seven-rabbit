import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, HotSort } from './product.entity';
import { Image } from '../common/common.entity';
import { Feature } from '../filter/feature.entity';
import { Category } from '../category/category.entity';
import { Statistics } from '../statistics/statistics.entity';
import { StatisticsService } from '../statistics/statistics.service';
import { CommonService } from '../common/common.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Image,
      Feature,
      Category,
      Statistics,
      HotSort,
    ]),
  ],
  providers: [ProductService, StatisticsService, CommonService],
  controllers: [ProductController],
})
export class ProductModule {}
