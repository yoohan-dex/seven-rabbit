import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { CommonModule } from './common/common.module';
import { FilterModule } from './filter/filter.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { StatisticsModule } from './statistics/statistics.module';
import { TagcloudModule } from './tagcloud/tagcloud.module';
import { OrderModule } from './order/order.module';
import { BuyerShowModule } from './buyer-show/buyer-show.module';
import { DatumModule } from './datum/datum.module';
import { WxModule } from './wx/wx.module';
import { TopicModule } from './topic/topic.module';
import { GenOrderModule } from './gen-order/gen-order.module';
import { QyModule } from './qy/qy.module';

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
    OrderModule,
    BuyerShowModule,
    DatumModule,
    WxModule,
    TopicModule,
    GenOrderModule,
    QyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
