import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';
import { Product } from '../product/product.entity';
import { WxUser } from '../auth/auth.entity';

@Entity()
export class SimpleData {
  @PrimaryGeneratedColumn() id: number;

  @Column('int') productId: number;
  @Column('int') userId: number;
  @Column('int') followUserId: number;

  @OneToOne(type => Product)
  product: Product;

  @OneToOne(type => WxUser)
  user: WxUser;

  @OneToOne(type => WxUser)
  followUser: WxUser;

  @CreateDateColumn() actionTime: Date;

  // 0 生成海报 1 扫码， 2 转发
  @Column({ default: 0 })
  type: 0 | 1 | 2 | 3;
}
