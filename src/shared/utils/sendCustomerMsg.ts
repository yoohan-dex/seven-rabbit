import { getAccessToken } from './getAccessToken';
import Axios from 'axios';

interface Params {
  openId: string;
  content?: string;
  type: 'text' | 'image';
  image?: {
    media_id: string;
  };
}

interface Data {
  touser: string;
  msgtype: Params['type'];
  content?: string;
  image?: {
    media_id: string;
  };
  access_token: string;
}

export const sendCustomerMsg = async ({
  openId,
  content,
  type,
  image,
}: Params) => {
  let token: string;
  try {
    const accessToken = await getAccessToken();
    token = accessToken;
  } catch (err) {}

  try {
    const data: Data = {
      touser: openId,
      msgtype: type,
      access_token: token,
    };

    if (data.msgtype === 'text') {
      data.content = content;
    } else if (data.msgtype === 'image') {
      data.image = image;
    }
    const res = await Axios({
      method: 'POST',
      url: `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`,
      data,
    });
    console.log('data', data);
    console.log('res', res.data);
  } catch (err) {
    console.log('err', err);
  }
};
