import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Entity,
} from 'typeorm';

@Entity()
export class WxMedia {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 300 })
  mediaId: string;

  @CreateDateColumn() createTime: Date;
}
