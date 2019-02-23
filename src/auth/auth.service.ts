import {
  Injectable,
  HttpException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { log } from 'console';
import * as signale from 'signale';
import * as Qcloudsms from 'qcloudsms_js';
import { WxUser } from './auth.entity';
import { Repository, Like, Raw } from 'typeorm';
import { UserInfo } from './interface';
import { genSmsCode } from './helper/genSmsCode';
@Injectable()
export class AuthService {
  qcloudsms: any;
  constructor(
    @InjectRepository(WxUser)
    private readonly authRepository: Repository<WxUser>,
  ) {
    const { SMS_APP_ID, SMS_APP_KEY } = process.env;
    log('???', process.env.SMS_APP_ID, process.env.SMS_APP_KEY, process.env);
    this.qcloudsms = Qcloudsms(SMS_APP_ID, SMS_APP_KEY);
  }

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
    if (!user.roles) {
      user.roles = ['client'];
    }
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
      log('user', user.roles);
      if (!user.roles) {
        user.roles = ['client'];
      }
      return await this.authRepository.save(user);
    } else {
      const newUser = new WxUser();
      newUser.sessionkey = sessionKey;
      newUser.skey = skey;
      newUser.userInfo = userInfo;
      newUser.openId = userInfo.openId;
      newUser.roles = ['client'];
      return await this.authRepository.save(newUser);
    }
  }

  async getOneUser() {
    const users = await this.authRepository.find();
    return users[0];
  }

  async saveInfo(user: WxUser, userInfo: any) {
    user.userInfo = userInfo;
    return await this.authRepository.save(user);
  }

  async saveRole(
    user: WxUser,
    role: string,
    nickname: string,
    adminId: string,
  ) {
    const admin = await this.authRepository.findOne(adminId);
    if (!admin) throw new ForbiddenException('没有这个管理员');
    if (!admin.roles.includes('admin'))
      throw new ForbiddenException('权限不够');
    if (!user.nickname) {
      user.nickname = nickname;
    }
    if (!user.roles.includes(role)) {
      user.roles.push(role);
    }
    return await this.authRepository.save(user);
  }

  async getMemberList(user: WxUser) {
    log('user!!!!----------', user);
    if (!user.roles.includes('admin')) throw new ForbiddenException('权限不够');
    return await this.authRepository.find({
      where: {
        roles: Raw(
          alias => `${alias} like '%primary%' or ${alias} like '%service%'`,
        ),
      },
    });
  }

  async bindphone(
    user: WxUser,
    phone: string,
    isWachat: boolean,
    code?: string,
  ) {
    const { SMS_TIMEOUT_MIN } = process.env;
    if (!isWachat) {
      const isSame = user.smsCode === code;
      if (!isSame) throw new BadRequestException('验证码不对, 请检查后再尝试');
      const now = new Date();
      const timeMax = parseInt(SMS_TIMEOUT_MIN, 10) * 60 * 1000;
      const timeOffset = now.getTime() - user.smsSendTime.getTime();
      log('timeOffset: ', timeOffset);
      const isTimeout = timeOffset > timeMax;
      log('istimeout', isTimeout);
      if (isTimeout)
        throw new BadRequestException('验证码已经超时，请重新获取验证码');
    }
    if (user.phone && user.phone.length > 3) {
      throw new BadRequestException('超过了绑定次数不能再绑定');
    }
    if (!user.phone) {
      user.phone = [phone];
    } else {
      user.phone = [phone, ...user.phone];
    }
    return await this.authRepository.save(user);
  }

  async sendSmsCode(user: WxUser, phone: string) {
    const { SMS_TIMEOUT_MIN, SMS_SIGN } = process.env;
    const cb = (err, res, resData) => {
      if (err) {
        log('err: ', err);
      } else {
        log('data: ', resData);
        if (resData.result === 0) {
          return 'ok';
        } else {
          throw new Error(err);
        }
      }
    };
    const templateId = 224443;
    const code = genSmsCode();
    user.smsCode = code;
    user.smsSendTime = new Date();
    await this.authRepository.save(user);
    const params = [code, SMS_TIMEOUT_MIN];
    const sender = this.qcloudsms.SmsSingleSender();
    sender.sendWithParam(86, phone, templateId, params, SMS_SIGN, '', '', cb);
  }
}
