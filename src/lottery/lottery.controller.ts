import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { WxUser } from '../auth/auth.entity';
import { User } from '../shared/decorators/user';
import { LotteryDto } from './lottery.dto';
import { LotteryService } from './lottery.service';

@Controller('lottery')
export class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  @Get()
  getGames() {
    return this.lotteryService.findAll();
  }

  @Post()
  createGame(@Body() data: LotteryDto) {
    console.log('data', data);
    return this.lotteryService.createOne(data);
  }

  @Get('bulk/:id')
  getGameById(@Param('id') id: number) {
    return this.lotteryService.findOneById(id);
  }

  @Post(':id')
  updateGame(@Param('id') id: number, @Body() data: LotteryDto) {
    return this.lotteryService.updateOne({ ...data, id });
  }

  @Delete(':id')
  deleteGame(@Param('id') id: number) {
    return this.lotteryService.deleteOne(id);
  }

  // 查看自己的奖品
  @Get('my-prize')
  checkMyPrize(@User() user: any, @Query('gameId') gameId: number) {
    return this.lotteryService.findPrizeByUser(user, gameId);
  }

  // 生成一个抽奖码
  @Get('code')
  genGameCode(
    @User() user: any,
    @Query('gameId') gameId: number,
    @Query('prizeId') prizeId: number,
  ) {
    return this.lotteryService.createOneCode(user, gameId, prizeId);
  }

  @Get('prize-code')
  getPrizeCode(@Query('codeId') codeId: number) {
    return this.lotteryService.getOneCode(codeId);
  }

  @Get('check-prize')
  checkPrize(@User() user: any, @Query('codeId') codeId: number) {
    return this.lotteryService.checkOneCode(user, codeId);
  }

  // 生成抽奖码后转发小程序给到用户后 用户登录即绑定抽奖码
  @Get('bind-code')
  bindGameCode(
    @User() user: any,
    @Query('gameId') gameId: number,
    @Query('code') code: number,
  ) {
    return this.lotteryService.bindOneCode(user, code, gameId);
  }

  // 开始抽奖
  @Get('start')
  startGame(@User() user: any, @Query('gameId') gameId: number) {
    return this.lotteryService.gameStart(user, gameId);
  }

  @Get('check-chance')
  checkChance(@User() user: any, @Query('gameId') gameId: number) {
    return this.lotteryService.checkChance(user, gameId);
  }

  @Get('test-code')
  testCode(@User() user: any, @Query('gameId') gameId: number) {
    return this.lotteryService.testCode(user, gameId);
  }
}
