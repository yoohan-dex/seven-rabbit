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
  // 0 spring 1 summer 2 autumn 3 winter 4 accesory
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

  // 0 春 1 夏 2 秋 3 冬 4 配件
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
