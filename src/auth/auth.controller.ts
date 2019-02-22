import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import * as signale from 'signale';
import ERRORS from './constants';
import getSessionKey from './helper/getSessionKey';
import sha1 from './helper/sha1';
import aesDecrypt from './helper/aesDecrypt';
import { AuthService } from './auth.service';
import { User } from '../shared/decorators/user';
import { WxUserDto, BindPhoneData } from './auth.dto';
import { WxUser } from './auth.entity';
import { UserInfo } from './interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('weapp/login')
  async weappLogin(
    @Headers('x-wx-code') code: string,
    @Headers('x-wx-encrypted-data') encryptedData: string,
    @Headers('x-wx-iv') iv: string,
  ) {
    if ([code, encryptedData, iv].some(v => !v)) {
      signale.debug('只有code 也就是没有用户授权');
      // throw new UnauthorizedException(ERRORS.ERR_HEADER_MISSED);
    }

    if (code && !encryptedData && !iv) {
      const { session_key, openid } = await getSessionKey(code);

      const skey = sha1(session_key);

      const {
        uuid: id,
        openId,
        roles,
      } = await this.authService.saveUserByOpenId(openid, skey, session_key);
      return {
        id,
        openId,
        skey,
        roles,
      };
    }

    signale.debug(
      `Auth: code: ${code}, encryptedData: ${encryptedData}, iv: ${iv}`,
    );

    const { session_key } = await getSessionKey(code);
    // generate 3rd_session
    const skey = sha1(session_key);

    // decrypt data
    let decryptedData;
    try {
      decryptedData = aesDecrypt(session_key, iv, encryptedData);
      decryptedData = JSON.parse(decryptedData);
    } catch (e) {
      signale.debug(`Auth: ${ERRORS.ERR_IN_DECRYPT_DATA}, ${e}`);
      throw new UnauthorizedException(`${ERRORS.ERR_IN_DECRYPT_DATA}\n${e}`);
    }

    // save
    const {
      userInfo,
      uuid: id,
      openId,
      roles,
      nickname,
    } = await this.authService.saveUserInfo(skey, session_key, decryptedData);
    return {
      skey,
      userInfo,
      id,
      openId,
      roles,
      nickname,
    };
  }

  @Post('weapp/userInfo')
  async saveUserInfo(@User() user: any, @Body() info: any) {
    return await this.authService.saveInfo(user, info);
  }

  @Get('weapp/user')
  async weappUser(@User() user: any) {
    return {
      id: user.uuid,
      userInfo: user.userInfo,
      roles: user.roles,
      nickname: user.nickname,
    };
  }

  @Post('weapp/bindphone')
  async weappBindphone(@User() user: any, @Body() data: BindPhoneData) {
    return await this.authService.bindphone(
      user,
      data.phone,
      data.isWechat,
      data.code,
    );
  }

  @Post('weapp/add-role')
  async weappAddRole(
    @User() user: any,
    @Body() data: { nickname: string; role: string; adminId: string },
  ) {
    console.log('user', user);
    return await this.authService.saveRole(
      user,
      data.role,
      data.nickname,
      data.adminId,
    );
  }

  @Post('weapp/decryptPhone')
  async decryptPhone(
    @User() user: WxUserDto,
    @Body() data: { iv: string; encryptedData: string },
  ) {
    const decryptedData = aesDecrypt(
      user.sessionkey,
      data.iv,
      data.encryptedData,
    );
    const { phoneNumber } = JSON.parse(decryptedData);
    return phoneNumber;
  }

  @Get('weapp/bindPhoneCode')
  async sendBindPhoneCode(@User() user: any, @Query('phone') phone: string) {
    return this.authService.sendSmsCode(user, phone);
  }
}
