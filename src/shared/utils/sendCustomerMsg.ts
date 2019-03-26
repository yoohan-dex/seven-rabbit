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
  msgType: Params['type'];
  content?: string;
  image?: {
    media_id: string;
  };
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
      msgType: type,
    };

    if (data.msgType === 'text') {
      data.content = content;
    } else if (data.msgType === 'image') {
      data.image = image;
    }
    const res = await Axios({
      method: 'POST',
      url: `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`,
      data,
    });
    console.log('res', res.data);
  } catch (err) {
    console.log('err', err);
  }
};
