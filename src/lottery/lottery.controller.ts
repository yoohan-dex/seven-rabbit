import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LotteryDto } from './lottery.dto';
import { LotteryService } from './lottyer.service';

@Controller('lottery')
export class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  @Get()
  getGames() {}

  @Get('bulk/:id')
  getGameById(@Param('id') id: number) {}

  @Post(':id')
  createGame(@Body() data: LotteryDto) {}

  @Patch(':id')
  updateGame() {}

  // 查看自己的奖品
  @Get('my-prize')
  checkMyPrize() {}

  // 生成一个抽奖码
  @Get('code')
  genGameCode() {}

  // 生成抽奖码后转发小程序给到用户后 用户登录即绑定抽奖码
  @Get('bind-code')
  bindGameCode(@Query('code') code: number) {}

  // 开始抽奖
  @Get('start')
  startGame() {}
}
