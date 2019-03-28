import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Filter } from '../filter/filter.entity';
import { Image } from '../common/common.entity';
import { Product } from '../product/product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn() id: number;

  @Column() name: string;

  @OneToOne(type => Image, { eager: true })
  @JoinColumn()
  image: Image;

  @Column('text') pos: string;
  @Column({ nullable: true })
  orderId: number;

  @ManyToMany(type => Filter, filter => filter.categories, { eager: true })
  @JoinTable()
  filters: Filter[];

  @OneToMany(type => Product, product => product.category)
  products: Product[];
}
