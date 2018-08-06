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
} from 'typeorm';
import { Image } from 'common/common.entity';
import { Feature } from 'filter/feature.entity';
import { Category } from 'category/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn() id: number;

  @Column() name: string;

  @OneToOne(type => Image, { eager: true })
  @JoinColumn()
  cover: Image;

  @ManyToMany(type => Image, { eager: true })
  @JoinTable()
  detail: Image[];

  @ManyToMany(type => Feature, { eager: true })
  @JoinTable()
  features: Feature[];

  @ManyToOne(type => Category, category => category.products, { eager: true })
  category: Category;

  @Column('int', { default: 0 })
  visitTimes: number;

  @Column('int', { default: 0 })
  favorTimes: number;
}
