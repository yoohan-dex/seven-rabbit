import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'common/common.entity';
import { Repository } from 'typeorm';
import { WxUser } from '../auth/auth.entity';
import { LotteryDto, updateLotteryDto } from './lottery.dto';
import { Lottery, LotteryCode, LotteryPrize } from './lottery.entity';

@Injectable()
export class LotteryService {
  constructor(
    @InjectRepository(Lottery)
    private readonly lotteryRepo: Repository<Lottery>,
    @InjectRepository(LotteryCode)
    private readonly lotteryCodeRepo: Repository<LotteryCode>,
    @InjectRepository(LotteryPrize)
    private readonly lotteryPrizeRepo: Repository<LotteryPrize>,
    @InjectRepository(Image) private readonly imageRepo: Repository<Image>,
  ) {}

  async findAll() {
    return await this.lotteryRepo.find();
  }

  async findOneById(id: number) {
    return await this.lotteryRepo.findOne(id);
  }

  async createOne(data: LotteryDto) {
    const lottery = new Lottery();
    lottery.name = data.name;
    lottery.message = data.message;
    lottery.rate = data.rate;
    lottery.startTime = data.startTime;
    lottery.stopTime = data.stopTime;
    lottery.maxPerUser = data.maxPerUser;

    const prizeSaver = data.prize.map(async p => {
      const prize = new LotteryPrize();
      prize.name = p.name;
      prize.description = p.description;
      prize.count = p.count;
      prize.trueRate = p.trueRate;

      prize.avatar = await this.imageRepo.findOne(p.avatar.id);
      return await this.lotteryPrizeRepo.save(prize);
    });

    lottery.prize = await Promise.all(prizeSaver);

    return await this.lotteryRepo.save(lottery);
  }

  async updateOne(data: updateLotteryDto) {
    const lottery = await this.lotteryRepo.findOne(data.id);

    lottery.name = data.name;
    lottery.message = data.message;
    lottery.rate = data.rate;
    lottery.startTime = data.startTime;
    lottery.stopTime = data.stopTime;
    lottery.maxPerUser = data.maxPerUser;

    const prizeSaver = data.prize.map(async p => {
      const prize = p.id
        ? await this.lotteryPrizeRepo.findOne(p.id)
        : new LotteryPrize();
      prize.name = p.name;
      prize.description = p.description;
      prize.count = p.count;
      prize.trueRate = p.trueRate;

      prize.avatar = await this.imageRepo.findOne(p.avatar.id);
      return await this.lotteryPrizeRepo.save(prize);
    });

    lottery.prize = await Promise.all(prizeSaver);
    return await this.lotteryRepo.save(lottery);
  }

  async createOneCode(user: WxUser, gameId: number) {
    const code = new LotteryCode();
    const game = await this.lotteryRepo.findOne(gameId);
    code.game = game;
    code.gameId = gameId;
    code.creator = user;
    return await this.lotteryCodeRepo.save(code);
  }

  async bindOneCode(user: WxUser, codeId: number, gameId: number) {
    const game = await this.lotteryRepo.findOne(gameId);
    if (!game) {
      throw new Error('活动不存在或者已经结束');
    }

    const now = new Date().getTime();

    if (now > game.stopTime) {
      throw new Error('活动已经结束');
    }

    const exist = await this.lotteryCodeRepo.find({
      where: {
        gameId,
        userId: user.id,
      },
      relations: ['game', 'user'],
    });
    if (exist.length >= game.maxPerUser) {
      throw new Error('已经超过能抽奖的次数');
    }
    const code = await this.lotteryCodeRepo.findOne(codeId, {
      relations: ['user'],
    });
    if (code.used || code.user) {
      throw new Error('已经被人抽过了');
    }
    code.user = user;
    return await this.lotteryCodeRepo.save(code);
  }

  async findPrizeByUser(user: WxUser, gameId: number) {
    const codes = await this.lotteryCodeRepo.find({
      where: {
        used: true,
        userId: user.id,
        gameId,
      },
      relations: ['prize', 'game', 'user'],
    });

    const prizes = codes.reduce((pre, curr) => {
      if (curr.prize && curr.prizeId) {
        return [...pre, curr.prize];
      }
      return pre;
    }, []);

    return prizes;
  }

  async validateCode(user: WxUser, gameId: number) {
    const code = await this.lotteryCodeRepo.find({
      where: {
        gameId,
        user: user.id,
        used: false,
      },
      relations: ['user', 'game'],
    });
    if (code.length < 1) {
      return false;
    }
    return true;
  }

  async gameStart(user: WxUser, gameId: number) {
    // 验证活动是否存在
    const game = await this.lotteryRepo.findOne(gameId);
    if (!game) {
      throw new Error('活动不存在');
    }

    // 验证是否在活动期间
    const now = new Date().getTime();
    if (now < game.startTime) {
      throw new Error('活动未开始');
    }
    if (now > game.stopTime) {
      throw new Error('活动已经结束');
    }

    // 验证抽奖码
    const code = await this.lotteryCodeRepo.findOne({
      where: {
        gameId,
        user: user.id,
        used: false,
      },
      relations: ['user', 'game'],
    });
    if (!code) {
      throw new Error('当前没有抽奖机会');
    }

    // 抽奖码使用
    code.used = true;

    // 中奖算法
    const wow = Math.random() * 100 > 100 - game.rate;

    // 没中奖的情况
    if (!wow) {
      return {
        wow,
      };
    }

    // 中奖的情况
    // 进行奖项算法
  }
}
