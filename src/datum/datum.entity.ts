import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Entity,
} from 'typeorm';

@Entity()
export class SimpleData {
  @PrimaryGeneratedColumn() id: number;

  @Column() productId: number;

  @Column() userId: number;

  @Column({ nullable: true })
  followUserId: number;

  @CreateDateColumn() actionTime: Date;

  // 0 gen poster 1 scan code， 2 after transfer, 3 view
  @Column({ default: 0 })
  type: 0 | 1 | 2 | 3;

  @Column({ default: 0 })
  stay: number;
}

@Entity()
export class TopicData {
  @PrimaryGeneratedColumn() id: number;

  @Column() userId: number;

  @Column() topicId: number;

  @CreateDateColumn() actionTime: Date;

  @Column({ default: 0 })
  type: 0;

  @Column({ default: 0 })
  stay: number;
}
