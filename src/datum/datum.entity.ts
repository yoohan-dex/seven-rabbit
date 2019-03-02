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

  @Column('int') pid: number;
  @Column('int') uid: number;
  @Column('int') fuid: number;

  @OneToOne(type => Product, { eager: true })
  product: Product;

  @OneToOne(type => WxUser, { eager: true })
  user: WxUser;

  @OneToOne(type => WxUser, { eager: true })
  followUser: WxUser;

  @CreateDateColumn() actionTime: Date;

  // 0 生成海报 1 扫码， 2 转发
  @Column({ default: 0 })
  type: 0 | 1 | 2 | 3;
}
