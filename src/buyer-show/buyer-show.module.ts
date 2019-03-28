import { Module } from '@nestjs/common';
import { BuyerShowController } from './buyer-show.controller';
import { BuyerShowService } from './buyer-show.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '../common/common.entity';
import { BuyerShow } from './buyer-show.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image, BuyerShow])],
  controllers: [BuyerShowController],
  providers: [BuyerShowService],
})
export class BuyerShowModule {}
