import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Product } from '../product/product.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 500 })
  name: string;

  @Column({ length: 500 })
  url: string;

  @Column('text') meta: string;

  @ManyToMany(type => Product, product => product.detail)
  product: Product[];
}
