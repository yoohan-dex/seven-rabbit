import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from '../../node_modules/typeorm';

@Entity()
export class Scantime {
  @PrimaryGeneratedColumn() id: number;

  @Column() productId: number;

  @Column() user: number;

  @CreateDateColumn() visitTime: Date;

  @Column('int') seconds: number;
}
