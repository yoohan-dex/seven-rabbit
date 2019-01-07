import {
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  Entity,
} from 'typeorm';
import { Image } from '../common/common.entity';

@Entity()
export class BuyerShow {
  @PrimaryGeneratedColumn() id: number;

  @Column({ nullable: true })
  name: string;

  @ManyToMany(type => Image, { eager: true })
  @JoinTable()
  detail: Image[];

  @Column({ default: 'image' })
  type: 'image' | 'video';

  @Column() videoUrl: string;
}
