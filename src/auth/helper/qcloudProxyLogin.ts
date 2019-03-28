import * as crypto from 'crypto';
import * as signale from 'signale';
import http from 'axios';
import ERRORS from '../constants';

export const qcloudProxyLogin = (secretId, secretKey, wxcode) => {
  const requestUrl = 'wss.api.qcloud.com/v2/index.php';
  const requestMethod = 'GET';
  const requestParams: any = {
    Action: 'GetSessionKey',
    js_code: wxcode,
  };

  requestParams.Timestamp = Math.floor(Date.now() / 1000);
  requestParams.Nonce = Math.floor(Math.random() * 10000000);
  requestParams.SecretId = secretId;
  requestParams.SignatureMethod = 'HmacSHA256';

  signale.debug('Request params', requestParams);

  const requestString = Object.keys(requestParams)
    .sort()
    .map(key => {
      /**
       * 注意：
       * 1、“参数值”为原始值而非 url 编码后的值。
       * 2、若输入参数的 Key 中包含下划线，则需要将其转换为“.”，但是 Value 中的下划线则不用转换。
       */
      return `${key.replace('_', '.')}=${requestParams[key]}`;
    })
    .join('&');

  signale.debug('Request string: ', requestString);

  const signatureRawString = `${requestMethod}${requestUrl}?${requestString}`;

  signale.debug('Signature raw string: ', signatureRawString);

  requestParams.Signature = new Buffer(
    crypto
      .createHmac('sha256', secretKey)
      .update(signatureRawString)
      .digest(),
  ).toString('base64');

  signale.debug('Signature: ', requestParams.Signature);

  return http({
    url: `https://${requestUrl}`,
    method: requestMethod,
    params: requestParams,
  });
};
