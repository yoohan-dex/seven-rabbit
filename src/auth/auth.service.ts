import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  async saveUserInfo(
    skey: string,
    userInfo: UserInfo,
    sessionKey: string,
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
