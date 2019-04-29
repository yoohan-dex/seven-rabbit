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

export class OrderCommon {
  @PrimaryGeneratedColumn() id: number;
  // order id
  @Column() orderNum: number;
  @Column() orderNumYear: number;
  @CreateDateColumn() createTime: Date;

  // client
  @Column() clientName: string;
  @Column() clientCompany: string;
  @Column() clientAddress: string;
  @Column() clientPhone: string;

  // custom message
  @Column('simple-array') meterial: Material[];
  @Column() printing: string;
  @Column() printingRemark: string;
  @Column() pattern: string;
  @Column() scaleType: number;
  @Column() detail: string;
  @Column('simple-array') clothesMsg: ClothesMsg[];

  // ! 0 七兔领标 1 空白领标 2 客户领标
  @Column({ type: 'enum' })
  neckTagType: 0 | 1 | 2;
  @OneToOne(type => Image, { eager: true })
  @JoinColumn()
  neckTag: Image;
  @ManyToMany(type => Image, { eager: true })
  @JoinTable()
  previewImages: Image[];

  // ! 楼主 小白 坤布 番茄 艺洋 002  -> 010
  // ! 黑兔 白兔 阿叉 -> yuanyuan
  @Column({ type: 'enum' })
  servicer: '010' | '005';

  // price
  @Column() totalNum: number;
  @Column() price: number;
  @Column() total: number;

  @Column() expressType: string;
  @Column() sendTime: string;
}

export interface ClothesMsg {
  color: string;
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
