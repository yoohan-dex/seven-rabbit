import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
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

  @OneToOne(type => Image, { eager: true })
  @JoinColumn()
  cover: Image;

  @OneToOne(type => Image, { eager: true })
  @JoinColumn()
  background: Image;

  @ManyToMany(type => Image, image => image.id, { eager: true })
  @JoinTable()
  detail: Image[];

  @CreateDateColumn() createTime: Date;
}
