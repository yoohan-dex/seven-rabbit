import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import * as signale from 'signale';
import ERRORS from './constants';
import getSessionKey from './helper/getSessionKey';
import sha1 from './helper/sha1';
import aesDecrypt from './helper/aesDecrypt';
import { AuthService } from './auth.service';
import { User } from 'shared/decorators/user';
import { WxUserDto } from './auth.dto';

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
      signale.debug(ERRORS.ERR_HEADER_MISSED);
      throw new UnauthorizedException(ERRORS.ERR_HEADER_MISSED);
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
    const { userInfo, uuid: id, openId } = await this.authService.saveUserInfo(
      skey,
      decryptedData,
      session_key,
    );
    return {
      skey,
      userInfo,
      id,
      openId,
    };
  }

  @Get('weapp/user')
  async weappUser(@User() user: WxUserDto) {
    return {
      id: user.uuid,
      userInfo: user.userInfo,
    };
  }
}
