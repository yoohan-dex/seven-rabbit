import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Product } from '../product/product.entity';
import { Topic } from 'topic/topic.entity';

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

  @ManyToMany(type => Topic, topic => topic.content)
  topic: Topic;
}
