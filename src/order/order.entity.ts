import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Image } from '../common/common.entity';
import { Content } from './content.entity';
import { IssueReason } from './issueReson.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn() id: number;

  @Column() orderNum: string;

  @Column() orderNumYear: string;

  @Column() clientName: string;

  @Column() clientCompany: string;

  @Column() clientAddress: string;

  @Column() clientPhone: string;

  @CreateDateColumn() createTime: Date;

  @UpdateDateColumn() updateTime: Date;

  @Column('simple-array') imageIds: number[];

  @ManyToMany(type => Image, { eager: true })
  @JoinTable()
  images: Image[];

  @Column() material: string;

  @Column() pattern: string;

  @Column() printing: string;

  @Column() detail: string;

  @OneToMany(type => Content, content => content.order, {
    eager: true,
  })
  content: Content[];

  @Column() totalNum: number;

  @Column() price: number;

  @Column() total: number;

  @Column() seller: string;

  @Column() remark: string;

  @Column() express: string;

  @Column({ nullable: true })
  expressNum: string;

  @Column({ nullable: true })
  expressType: '顺丰' | '德邦' | '韵达';

  @Column() sendTime: Date;

  @Column({ nullable: true })
  singleCosting: number;

  @Column({ nullable: true })
  expressCosting: number;

  @Column({ nullable: true })
  issueCosting: number;
  @ManyToMany(type => IssueReason, {
    eager: true,
  })
  @JoinTable()
  issueReason: IssueReason[];

  @Column({ nullable: true })
  cost: number;

  @Column({ default: 0 })
  adultNum: number;

  @Column({ default: 0 })
  adultCost: number;

  @Column({ default: 0 })
  childNum: number;

  @Column({ default: 0 })
  childCost: number;

  @Column({ nullable: true })
  profit: number;

  /**
   * 0 未付款
   * 1 付半款
   * 2 付全款
   */
  @Column({ default: 0 })
  paymentStatus: 0 | 1 | 2;

  @Column({ nullable: true })
  issueStatus: string;
  /**
   * 0 已确认订单
   * 1 生产中
   * 2 已发货
   * 3 已结单
   * 4 出现售后问题
   * 5 售后后结单
   */
  @Column({ default: 0 })
  status: 0 | 1 | 2 | 3 | 4 | 5;

  /**
   * 0 准备开工
   * 1 裁片
   * 2 裁片完成
   * 3 印花
   * 4 印花完成
   * 5 车衣
   * 6 车衣完成
   * 7 后整
   * 8 后整完成
   * 9 打包发货
   * 10 已发货
   */
  @Column({ default: 0 })
  progress: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  @Column({ default: false })
  timeout: boolean;
}
