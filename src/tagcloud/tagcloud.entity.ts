import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from '../../node_modules/typeorm';

@Entity()
export class Tagcloud {
  @PrimaryGeneratedColumn() id: number;

  @Column() featureId: number;

  @CreateDateColumn() actionTime: Date;
}
