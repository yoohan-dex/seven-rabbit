import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category } from './category.entity';
import { Filter } from '../filter/filter.entity';
import { Image } from '../common/common.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Filter, Image])],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
