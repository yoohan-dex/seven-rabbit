import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { Filter } from './filter.entity';
import { Product } from 'product/product.entity';

@Entity()
export class Feature {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 40 })
  name: string;

  @ManyToOne(type => Filter, filter => filter.features)
  filter: Filter;

  @ManyToMany(type => Product)
  products: Product[];
}
