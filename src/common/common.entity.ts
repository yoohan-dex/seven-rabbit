import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToOne,
} from 'typeorm';
import { Product } from '../product/product.entity';
import { Order } from 'order/order.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 500 })
  name: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 500 })
  originUrl: string;

  @Column('text') meta: string;

  @Column() width: number;

  @Column() height: number;

  @ManyToMany(type => Product, product => product.detail)
  product: Product[];
}
