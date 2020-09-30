import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lottery, LotteryCode, LotteryPrize } from './lottery.entity';
import { WxUser } from '../auth/auth.entity';
import { LotteryService } from './lottery.service';
import { LotteryController } from './lottery.controller';
import { Image } from '../common/common.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lottery,
      WxUser,
      LotteryCode,
      LotteryPrize,
      Image,
    ]),
  ],
  providers: [LotteryService],
  controllers: [LotteryController],
})
export class LotteryModule {}
