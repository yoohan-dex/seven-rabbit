import { getAccessToken } from './getAccessToken';
import * as shortid from 'shortid';
import * as path from 'path';
import Axios from 'axios';
import { createWriteStream } from 'fs';

export const getWXACode = async (page: string, scene: string): Promise<any> => {
  let token: string;
  try {
    const accessToken = await getAccessToken();
    token = accessToken;
  } catch (err) {}
  try {
    const url = path.resolve(process.cwd(), 'tmp', `${shortid.generate()}.png`);
    const stream = createWriteStream(url);
    const res = await Axios({
      method: 'POST',
      url: `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`,
      data: {
        scene,
        page,
        width: 1280,
        // line_color: '#78a4fa',
      },
      responseType: 'stream',
    });
    res.data.pipe(stream);
    return new Promise(resolve => {
      stream.on('finish', () => resolve(url));
    });
  } catch (err) {
    console.log('err', err);
  }
};
