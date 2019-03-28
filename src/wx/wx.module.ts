import { Module } from '@nestjs/common';
import { WxController } from './wx.controller';
import { WxService } from './wx.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WxMedia } from './wx.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WxMedia])],
  controllers: [WxController],
  providers: [WxService],
})
export class WxModule {}
