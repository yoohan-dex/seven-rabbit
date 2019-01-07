import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

import { Order } from './order.entity';

@Entity()
export class IssueReason {
  @PrimaryGeneratedColumn() id: number;
  @Column() content: string;
  @ManyToMany(type => Order)
  order: Order[];
}
