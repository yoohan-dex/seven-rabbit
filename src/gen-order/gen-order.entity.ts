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
  // order id
  @Column() orderNum: number;
  @Column() orderNumYear: number;
  @Column() orderName: string;
  @Column() transactionCode: string;
  @CreateDateColumn() createTime: Date;

  // client
  @Column() clientName: string;
  @Column() clientCompany: string;
  @Column() clientAddress: string;
  @Column() clientPhone: string;

  // custom message
  @Column() material: string;
  @Column() printing: string;
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
