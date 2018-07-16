import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Image } from 'common/common.entity';
import { Feature } from 'filter/feature.entity';
import { Category } from 'category/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Image, Feature, Category])],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
