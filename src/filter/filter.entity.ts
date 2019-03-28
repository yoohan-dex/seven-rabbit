import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Feature } from './feature.entity';
import { Category } from '../category/category.entity';

@Entity()
export class Filter {
  @PrimaryGeneratedColumn() id: number;

  @Column() name: string;

  @Column('text') pos: string;

  @OneToMany(type => Feature, feature => feature.filter, {
    eager: true,
  })
  features: Feature[];

  @ManyToMany(type => Category, category => category.filters)
  categories: Category[];
}
