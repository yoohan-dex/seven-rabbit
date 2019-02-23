import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Product } from '../product/product.entity';

@Entity()
export class Statistics {
  @PrimaryGeneratedColumn() id: number;

  @Column() productId: number;

  // @ManyToOne(type => Product)
  // product: Product;

  @CreateDateColumn() actionTime: Date;

  // 1 点击， 2 收藏转发, 3 分享
  @Column({ default: 1 })
  type: 1 | 2 | 3;

  @Column('int') user: number;
}
