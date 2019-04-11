import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Image } from '../common/common.entity';
import { Feature } from '../filter/feature.entity';
import { Category } from '../category/category.entity';

@Entity()
export class HotSort {
  @PrimaryGeneratedColumn() id: number;
  // 1 spring 2 summer 3 autumn 4 winter 5 accesory
  @Column() type: number;
  @Column('simple-array') productIds: number[];
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn() id: number;

  @Column() name: string;

  @OneToOne(type => Image, { eager: true })
  @JoinColumn()
  cover: Image;

  @OneToOne(type => Image, { eager: true })
  @JoinColumn()
  squreCover: Image;

  @OneToOne(type => Image, { eager: true })
  @JoinColumn()
  shareCover: Image;

  @ManyToMany(type => Image, { eager: true })
  @JoinTable()
  detail: Image[];

  @ManyToMany(type => Feature, { eager: true })
  @JoinTable()
  features: Feature[];

  @ManyToOne(type => Category, category => category.products, { eager: true })
  category: Category;

  @Column({ default: false })
  hot: boolean;

  // 1 春 2 夏 3 秋 4 冬 5 配件
  @Column({ nullable: true })
  hotType: number;

  @Column('int', { default: 0 })
  visitTimes: number;

  @Column('int', { default: 0 })
  favorTimes: number;

  @CreateDateColumn({ nullable: true })
  createTime: Date;

  @UpdateDateColumn({ nullable: true })
  updateTime: Date;
}
