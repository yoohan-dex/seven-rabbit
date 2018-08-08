import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as signale from 'signale';
import { WxUser } from './auth.entity';
import { Repository } from 'typeorm';
import { UserInfo } from './interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(WxUser)
    private readonly authRepository: Repository<WxUser>,
  ) {}

  async getUserInfoBySKey(skey: string) {
    return await this.authRepository.findOne({ skey });
  }
  async saveUserByOpenId(openId: string, skey: string, sessionKey: string) {
    let user = await this.authRepository.findOne({ openId });
    if (!user) {
      user = new WxUser();
    }
    user.skey = skey;
    user.sessionkey = sessionKey;
    user.openId = openId;
    signale.debug('newUser', user);
    return await this.authRepository.save(user);
  }

  async saveUserInfo(
    skey: string,
    sessionKey: string,
    userInfo: UserInfo,
  ): Promise<WxUser> {
    const user = await this.authRepository.findOne({ openId: userInfo.openId });
    if (user) {
      user.sessionkey = sessionKey;
      user.skey = skey;
      user.userInfo = userInfo;
      user.openId = userInfo.openId;
      return await this.authRepository.save(user);
    } else {
      const newUser = new WxUser();
      newUser.sessionkey = sessionKey;
      newUser.skey = skey;
      newUser.userInfo = userInfo;
      newUser.openId = userInfo.openId;
      return await this.authRepository.save(newUser);
    }
  }

  async getOneUser() {
    const users = await this.authRepository.find();
    return users[0];
  }
}
