import http from 'axios';
import * as signale from 'signale';
import { BadRequestException } from '@nestjs/common';
import ERRORS from '../constants';

export default async function getSessionKey(code: string) {
  const useQcloudLogin = process.env.USE_QCLOUD_LOGIN;

  // 使用腾讯云代小程序登录
  if (useQcloudLogin) {
    const qcloudSecretId = process.env.QCLOUD_SECRET_ID;
    const qcloudSecretKey = process.env.QCLOUD_SECRET_KEY;
    // return qcloudProxyLogin(qcloudSecretId, qcloudSecretKey, code).then(res => {
    //     res = res.data
    //     console.log(res)
    //     if (res.code !== 0 || !res.data.openid || !res.data.session_key) {
    //         debug('%s: %O', ERRORS.ERR_GET_SESSION_KEY, res)
    //         throw new Error(`${ERRORS.ERR_GET_SESSION_KEY}\n${JSON.stringify(res)}`)
    //     } else {
    //         debug('openid: %s, session_key: %s', res.data.openid, res.data.session_key)
    //         return res.data;
    //     }
    // });
  } else {
    const appid = process.env.WX_APPID;
    const appsecret = process.env.WX_APPSECRET;
    console.log('appsecret', appsecret);
    const { data } = (await http({
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      method: 'GET',
      params: {
        appid,
        secret: appsecret,
        js_code: code,
        grant_type: 'authorization_code',
      },
    })) as {
      data: {
        errcode?: string;
        openid?: string;
        session_key?: string;
        errmsg?: string;
      };
    };
    if (data.errcode || !data.openid || !data.session_key) {
      signale.debug('%s: %O', ERRORS.ERR_GET_SESSION_KEY, data.errmsg);
      throw new BadRequestException(
        `${ERRORS.ERR_GET_SESSION_KEY}\n${JSON.stringify(data)}`,
      );
    } else {
      signale.debug(
        'openid: %s, session_key: %s',
        data.openid,
        data.session_key,
      );
      return data;
    }
  }
}
