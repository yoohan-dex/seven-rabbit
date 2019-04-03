import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Image } from '../common/common.entity';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn() id: number;

  @Column() primaryTitle: string;

  @Column() secondTitle: string;

  @Column() footerTitle: string;

  @Column({ default: 'poster' })
  type: 'poster' | 'product';

  @OneToOne(type => Image)
  cover: Image;

  @OneToMany(type => Image, image => image.id)
  content: Image[];

  @CreateDateColumn() createTime: Date;
}
