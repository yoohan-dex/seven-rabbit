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
export class TopicSort {
  @PrimaryGeneratedColumn() id: number;
  @Column('simple-array') topicIds: number[];
}

@Entity()
export class Topic {
  @PrimaryGeneratedColumn() id: number;

  @Column({
    nullable: true,
  })
  title?: string;

  @Column({ default: 'poster' })
  type: 'poster' | 'product';

  @OneToOne(type => Image)
  cover: Image;

  @OneToMany(type => Image, image => image.id)
  content: Image[];

  @CreateDateColumn() createTime: Date;
}
