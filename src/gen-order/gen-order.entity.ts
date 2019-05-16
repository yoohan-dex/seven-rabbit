import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Image } from '../common/common.entity';

@Entity()
export class OrderCommon {
  @PrimaryGeneratedColumn() id: number;
  @Column() transactionCode: string;
  // order id
  @Column() orderNum: number;
  @Column() orderNumYear: number;
  @Column() orderName: string;
  @CreateDateColumn() createTime: Date;

  // client
  @Column({ nullable: true })
  clientName: string;
  @Column({ nullable: true })
  clientCompany: string;
  @Column({ nullable: true })
  clientAddress: string;
  @Column({ nullable: true })
  clientPhone: string;

  // custom message
  @Column() material: string;
  @Column() printing: string;
  @Column({
    default: '七兔包装袋',
  })
  package: string;
  @Column() printingRemark: string;
  // ! 0 儿童放大一码 1 成人放大一码 2 全放大一码
  @Column() pattern: string;
  @Column() scaleType: number;
  @Column() scaleText: string;
  @Column() detail: string;
  @Column('simple-array') clothesMsg: ClothesMsg[];

  // ! 0 七兔领标 1 空白领标 2 客户领标
  @Column({ default: 0 })
  neckTagType: number;
  @OneToOne(type => Image, { eager: true })
  @JoinColumn()
  neckTag: Image;
  @ManyToMany(type => Image, { eager: true })
  @JoinTable()
  previewImages: Image[];

  // ! 楼主 小白 坤布 番茄 艺洋 002  -> 010
  // ! 黑兔 白兔 阿叉 -> yuanyuan
  @Column() servicer: string;
  @Column() seller: string;
  @Column({
    default: '七兔',
  })
  sender: string;
  @Column({
    default: '13420194742',
  })
  senderPhone: string;

  // price
  @Column() totalNum: number;
  @Column() price: number;
  @Column() total: number;

  @Column({
    default: false,
  })
  isHurry: boolean;

  @Column() express: string;
  @Column() sendTime: string;
  @Column() sendDay: string;

  @Column() remark: string;
}

export interface ClothesMsg {
  color: string;
  count: number;
  rules: Rule[];
}

export interface Rule {
  count: number;
  size: Size;
}

export type Size =
  | 90
  | 100
  | 110
  | 120
  | 130
  | 140
  | 150
  | 160
  | 'XS'
  | 'S'
  | 'M'
  | 'L'
  | 'XL'
  | '2XL'
  | '3XL'
  | '4XL';

export interface Material {
  num: number;
  primary: string;
  addition: string;
}
