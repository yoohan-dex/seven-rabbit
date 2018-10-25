import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './content.entity';
import { Order } from './order.entity';
import { Image } from '../common/common.entity';
import { CommonService } from '../common/common.service';

@Module({
  imports: [TypeOrmModule.forFeature([Content, Order, Image])],
  controllers: [OrderController],
  providers: [OrderService, CommonService],
})
export class OrderModule {}
