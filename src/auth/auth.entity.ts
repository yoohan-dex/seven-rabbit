import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { UserInfo } from './interface';

@Entity()
export class WxUser {
  @PrimaryGeneratedColumn('uuid') uuid: string;

  @Column({ length: 100 })
  openId: string;

  @Column({ length: 100 })
  skey: string;

  @Column({ length: 100 })
  sessionkey: string;

  @Column({ type: 'simple-json', nullable: true })
  userInfo: UserInfo;

  @Column({ type: 'simple-array', nullable: true })
  phone: string[];

  /**
   * 普通用户
   * 管理员： admin
   * 主号： primary
   * 客服： service
   */
  @Column({ type: 'simple-array' })
  roles: string[];

  @Column({ nullable: true })
  smsCode: string;

  @Column({ nullable: true })
  smsSendTime: Date;

  @CreateDateColumn() createTime: Date;
  @UpdateDateColumn() lastVisitTime: Date;
}
