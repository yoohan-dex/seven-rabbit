import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../product/product.entity';
import { WxUser } from '../auth/auth.entity';

@Entity()
export class SimpleData {
  @PrimaryGeneratedColumn() id: number;

  @OneToOne(type => Product, { eager: true })
  @JoinColumn()
  product: Product;

  @OneToOne(type => WxUser, { eager: true })
  @JoinColumn()
  user: WxUser;

  @OneToOne(type => WxUser, { eager: true })
  @JoinColumn()
  followUser: WxUser;

  @CreateDateColumn() actionTime: Date;

  // 0 生成海报 1 扫码， 2 转发
  @Column({ default: 0 })
  type: 0 | 1 | 2 | 3;
}
