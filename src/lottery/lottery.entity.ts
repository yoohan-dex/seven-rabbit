import { WxUser } from '../auth/auth.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @Column() startTime: string;

  @Column() stopTime: string;

  @OneToOne(type => Image, { eager: true })
  @JoinColumn()
  headAvatar: Image;

  @Column() rate: number;

  @Column({ nullable: true })
  maxPerUser: number;

  @OneToMany(_ => LotteryPrize, p => p.game, { eager: true })
  prize: LotteryPrize[];
}

@Entity()
export class LotteryPrize {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(_ => Lottery, l => l.prize)
  game: Lottery;

  @Column({ nullable: true })
  gameId: number;

  @Column() name: string;

  @OneToOne(type => Image, { eager: true })
  @JoinColumn()
  avatar: Image;

  @Column({ nullable: true })
  description: string;

  @Column() count: number;

  @Column({ default: 0 })
  usedCount: number;

  @Column({ default: true })
  trueRate: boolean;
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

  // @ManyToOne(_ => WxUser, { nullable: true })
  // creator: WxUser;

  @Column({ nullable: true })
  creatorId: number;

  @Column({ nullable: true })
  gameId: number;

  @ManyToOne(_ => LotteryPrize, { nullable: true, eager: true })
  prize: LotteryPrize;

  @Column({ nullable: true })
  prizeId: number;

  @Column({ default: false })
  isCtrl: boolean;

  // @ManyToOne(_ => WxUser, { nullable: true })
  // user: WxUser;

  @Column({ nullable: true })
  prizerId: number;

  @Column({ nullable: true })
  userId: number;

  @Column({ default: false, nullable: true })
  used: boolean;

  @Column({ default: false, nullable: true })
  checked: boolean;

  @Column({ nullable: true })
  checkerId: number;
  // 获奖时间
  @Column('date', { nullable: true })
  getDate: Date;

  @CreateDateColumn() createDate: Date;

  @UpdateDateColumn() updateDate: Date;
}
