import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { Order } from './order.entity';

@Entity()
export class Content {
  @PrimaryGeneratedColumn() id: number;
  @Column('json') content: object;
  @Column({ nullable: true })
  color: string;
  @ManyToOne(type => Order, order => order.content)
  order: Order;
}
