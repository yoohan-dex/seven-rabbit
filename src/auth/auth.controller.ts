import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
  Post,
  Body,
} from '@nestjs/common';
import * as signale from 'signale';
import ERRORS from './constants';
import getSessionKey from './helper/getSessionKey';
import sha1 from './helper/sha1';
import aesDecrypt from './helper/aesDecrypt';
import { AuthService } from './auth.service';
import { User } from '../shared/decorators/user';
import { WxUserDto } from './auth.dto';
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
    } = await this.authService.saveUserInfo(skey, session_key, decryptedData);
    return {
      skey,
      userInfo,
      id,
      openId,
      roles,
    };
  }

  @Post('weapp/userInfo')
  async saveUserInfo(@User() user: any, @Body() info: any) {
    return await this.authService.saveInfo(user, info);
  }

  @Get('weapp/user')
  async weappUser(@User() user: WxUserDto) {
    return {
      id: user.uuid,
      userInfo: user.userInfo,
      roles: user.roles,
    };
  }

  @Post('weapp/bindphone')
  async weappBindphone(@User() user: any, @Body() data) {
    return await this.authService.bindphone(user as WxUser, data.phone);
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
}
