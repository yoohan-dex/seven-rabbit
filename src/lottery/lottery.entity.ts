import { WxUser } from 'auth/auth.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Image } from '../common/common.entity';

/**
 * game {
	ID,
	name,
	message,
	starttime,
	stoptime,
	rate,
	prize: {
		ID，
		name,
		avatar,
		description,
		count,
		rate: 真实概率 or 0,
	}[]
}
 */

@Entity()
export class Lottery {
  @PrimaryGeneratedColumn() id: number;

  @Column() name: string;

  @Column() message: string;

  @Column() startTime: number;

  @Column() stopTime: number;

  @Column() rate: number;

  @Column() maxPerUser: number;

  @OneToMany(_ => LotteryPrize, p => p.game)
  prize: LotteryPrize[];
}

@Entity()
export class LotteryPrize {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(_ => Lottery, l => l.prize, { eager: true })
  game: Lottery;

  @Column() gameId: number;

  @Column() name: string;

  @OneToOne(type => Image, { eager: true })
  @JoinColumn()
  avatar: Image;

  @Column({ nullable: true })
  description: string;

  @Column() count: number;

  @Column() trueRate: boolean;
}

/**
 * 抽奖码 「
	ID，
	gameId，
	user，
	prize，
	used，
」

 */
@Entity()
export class LotteryCode {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(_ => WxUser, { nullable: true })
  creator: WxUser;

  @Column() creatorId: number;

  @ManyToOne(_ => Lottery, { eager: true })
  game: Lottery;

  @Column() gameId: number;

  @ManyToOne(_ => LotteryPrize, { nullable: true })
  prize: LotteryPrize;

  @Column() prizeId: number;

  @ManyToOne(_ => WxUser, { nullable: true })
  user: WxUser;

  @Column() userId: number;

  @Column() used: boolean;
}
