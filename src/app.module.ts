import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from 'app.controller';
import { AppService } from 'app.service';
import { CategoryModule } from 'category/category.module';
import { CommonModule } from 'common/common.module';
import { FilterModule } from 'filter/filter.module';
import { ProductModule } from 'product/product.module';
import { AuthModule } from 'auth/auth.module';
import { ConnectionOptions, getConnectionOptions } from 'typeorm';
import { StatisticsModule } from 'statistics/statistics.module';
import { TagcloudModule } from './tagcloud/tagcloud.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    CategoryModule,
    CommonModule,
    FilterModule,
    ProductModule,
    AuthModule,
    StatisticsModule,
    TagcloudModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
