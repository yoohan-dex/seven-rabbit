import { Module } from '@nestjs/common';
import { GenOrderController } from './gen-order.controller';
import { GenOrderService } from './gen-order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderCommon } from './gen-order.entity';
import { Image } from '../common/common.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderCommon, Image])],
  controllers: [GenOrderController],
  providers: [GenOrderService],
})
export class GenOrderModule {}
