import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from '../common/common.entity';
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
    @InjectRepository(WxUser) private readonly userRepo: Repository<WxUser>,
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
    lottery.headAvatar = await this.imageRepo.findOne(data.headAvatar.id);

    const prizeSaver = data.prize.map(async p => {
      const prize = new LotteryPrize();
      prize.name = p.name;
      prize.description = p.description;
      prize.count = p.count;
      prize.trueRate = p.trueRate;

      prize.avatar = await this.imageRepo.findOne(p.avatar.id);
      console.log('prize', prize);
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
    lottery.headAvatar = await this.imageRepo.findOne(data.headAvatar.id);

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

  async deleteOne(id: number) {
    return await this.lotteryRepo.delete(id);
  }

  async testCode(user: WxUser, gameId: number) {
    const code = await this.createOneCode(user, gameId);
    return await this.bindOneCode(user, code.id, gameId);
  }

  async createOneCode(user: WxUser, gameId: number, prizeId?: number) {
    try {
      const code = new LotteryCode();
      const game = await this.lotteryRepo.findOne(gameId);

      code.gameId = game.id;
      code.creatorId = user.id;
      if (prizeId) {
        const prize = await this.lotteryPrizeRepo.findOne(prizeId);
        if (prize) {
          prize.usedCount += 1;
          await this.lotteryPrizeRepo.save(prize);
          code.prize = prize;
          code.prizerId = user.id;
        }
      }
      return await this.lotteryCodeRepo.save(code);
    } catch (err) {
      throw new Error(err);
    }
  }

  async getOneCode(codeId: number) {
    const code = await this.lotteryCodeRepo.findOne(codeId);
    const user = await this.userRepo.findOne(code.userId);
    const creator = await this.userRepo.findOne(code.creatorId);
    return {
      ...code,
      user,
      creator,
    };
  }

  async checkOneCode(user: WxUser, codeId: number) {
    const code = await this.lotteryCodeRepo.findOne(codeId);
    code.checked = true;
    code.checkerId = user.id;
    return await this.lotteryCodeRepo.save(code);
  }

  async bindOneCode(user: WxUser, codeId: number, gameId: number) {
    const game = await this.lotteryRepo.findOne(gameId);
    if (!game) {
      return {
        code: 404,
        ok: false,
        msg: '活动不存在或者已经结束',
      };
    }

    const now = new Date().getTime();

    if (now > new Date(game.stopTime).getTime()) {
      return {
        code: 404,
        ok: false,
        msg: '活动已经结束',
      };
    }

    const exist = await this.lotteryCodeRepo.find({
      where: {
        gameId,
        userId: user.id,
      },
    });
    if (game.maxPerUser && exist.length >= game.maxPerUser) {
      return {
        code: 150,
        ok: false,
        msg: '已经超过能抽奖的次数',
      };
    }
    const code = await this.lotteryCodeRepo.findOne(codeId);
    if (code.used) {
      return {
        code: 100,
        ok: false,
        msg: '你的抽奖资格已经使用了',
      };
    }
    code.userId = user.id;
    console.log('!!!!!!!!!!!!!!!!!', code);
    return await this.lotteryCodeRepo.save(code);
  }

  async findPrizeByUser(user: WxUser, gameId: number) {
    const codes = await this.lotteryCodeRepo.find({
      where: {
        used: true,
        userId: user.id,
        gameId,
      },
    });
    console.log('codes', codes);

    const prizes = codes.reduce((pre, curr) => {
      if (curr.prize && curr.prizeId) {
        return [
          ...pre,
          { ...curr.prize, codeId: curr.id, checked: curr.checked },
        ];
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
    });
    if (code.length < 1) {
      return false;
    }
    return true;
  }
  // 404 活动没有
  // 100 抽奖资格没有
  async gameStart(user: WxUser, gameId: number) {
    // 验证活动是否存在
    const game = await this.lotteryRepo.findOne(gameId);
    if (!game) {
      return {
        code: 404,
        ok: false,
        msg: '活动不存在',
      };
    }

    // 验证是否在活动期间
    const now = new Date().getTime();
    if (now < new Date(game.startTime).getTime()) {
      return {
        code: 404,
        ok: false,
        msg: '活动未开始',
      };
    }
    if (now > new Date(game.stopTime).getTime()) {
      return {
        code: 404,
        ok: false,
        msg: '活动已经结束',
      };
    }

    // 验证抽奖码
    const code = await this.lotteryCodeRepo.findOne({
      where: {
        gameId,
        user: user.id,
        used: false,
      },
    });
    if (!code) {
      return {
        code: 100,
        ok: false,
        msg: '当前没有抽奖机会',
      };
    }

    // 抽奖码使用
    code.used = true;

    // 中奖算法
    const wow = Math.random() * 100 > 100 - game.rate;
    if (code.prize) {
      await this.lotteryCodeRepo.save(code);
      return {
        ok: true,
        wow: true,
        prize: code.prize,
      };
    }

    // 没中奖的情况
    if (!wow) {
      return {
        ok: true,
        wow,
      };
    }

    // 中奖的情况
    // 进行奖项算法
    const prizes = game.prize
      .filter(p => p.trueRate) // 去掉不用真实概率的奖品
      .map(p => ({ ...p, leftCount: p.count - p.usedCount })) // 统计出每个奖品的剩余数量
      .filter(p => p.leftCount > 0); // 去掉剩余数量不足1的奖品
    const allLeftCount = prizes.reduce((pre, curr) => pre + curr.leftCount, 0);
    const prizesWithRate = prizes.map((p, idx: number) => ({
      ...p,
      leftRate:
        p.leftCount +
        prizes.slice(0, idx).reduce((pre, curr) => pre + curr.leftCount, 0),
    }));

    const cool = Math.random() * allLeftCount;

    const prize: LotteryPrize = takePrizeFunction(0, 1, cool, prizesWithRate);

    const truePrize = await this.lotteryPrizeRepo.findOne(prize.id);

    truePrize.usedCount += 1;

    code.prize = truePrize;

    await this.lotteryCodeRepo.save(code);
    return {
      ok: true,
      wow: true,
      prize: await this.lotteryPrizeRepo.save(truePrize),
    };
  }

  async checkChance(user: WxUser, gameId: number) {
    const game = await this.lotteryRepo.findOne(gameId);
    if (!game) {
      return {
        code: 404,
        ok: false,
        msg: '活动不存在',
      };
    }

    // 验证是否在活动期间
    const now = new Date().getTime();
    if (now < new Date(game.startTime).getTime()) {
      return {
        code: 404,
        ok: false,
        msg: '活动未开始',
      };
    }
    if (now > new Date(game.stopTime).getTime()) {
      return {
        code: 404,
        ok: false,
        msg: '活动已经结束',
      };
    }

    // 验证抽奖码
    const code = await this.lotteryCodeRepo.findOne({
      where: {
        gameId,
        userId: user.id,
        used: false,
      },
    });
    if (!code) {
      return {
        code: 100,
        ok: false,
        msg: '当前没有抽奖机会',
      };
    }
    return {
      ok: true,
      code,
    };
  }
}

const takePrizeFunction = (
  leftIdx: number,
  rightIdx: number,
  rate: number,
  arr: any[],
) => {
  if (rate > arr[leftIdx].leftRate && rate > arr[rightIdx].leftRate) {
    return takePrizeFunction(rightIdx, rightIdx + 1, rate, arr);
  }

  if (rate > arr[leftIdx].leftRate && rate <= arr[rightIdx].leftRate) {
    return arr[rightIdx] as LotteryPrize;
  }

  if (rate <= arr[leftIdx].leftRate) {
    return arr[leftIdx] as LotteryPrize;
  }
};
